const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

// Middleware

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import



//routes declaration


module.exports = app;
