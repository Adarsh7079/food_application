const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const connectDB = require("./db");
const app = require("./app");

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB !!!", error);

    process.exit(1);
  });
