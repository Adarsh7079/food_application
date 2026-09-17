const dotenv = require("dotenv");
const connectDB = require("./db");
const app = require("./app");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.error("Error connecting to MongoDB !!!", error);
    process.exit(1); // Exit the process with an error code
});
