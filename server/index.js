import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from "dotenv";
import multer, { diskStorage } from 'multer';
import helmet from "helmet"
import morgan from "morgan"
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import { register } from "./controllers/auth.js"
import { createPost } from "./controllers/posts.js"
import { verifyToken } from './middleware/auth.js';

//Middleware

// Converts the current module's URL (the file you're writing this code in) to a file path string. This is a replacement for __filename in CommonJS.
const __filename = fileURLToPath(import.meta.url);

// Extracts the directory name of the current file. This is a replacement for __dirname in CommonJS.
const __dirname = path.dirname(__filename);

// This loads the .env file and makes its values available in process.env
dotenv.config();

const app = express();

// Parses incoming requests with JSON payloads. It allows you to access JSON data sent in POST or PUT requests via req.body.
app.use(express.json());


app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy : "cross-origin"}))
app.use(morgan("common"));
app.use(bodyParser.json( { limit: "30mb", extended : true}))
app.use(bodyParser.urlencoded( { limit: "30mb", extended : true} ))
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')))

//File Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer ({ storage });


// Routes with files
app.post("auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost)

//Routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts"/ postRoutes)


// Database
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}) 
.catch((error) => console.log(`${error} did not connect`));
