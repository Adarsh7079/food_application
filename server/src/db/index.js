const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${process.env.DB_NAME}?retryWrites=true&w=majority`
        );

        console.log(
            `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("MONGODB connection FAILED:", error);
        process.exit(1);
    }
};

module.exports = connectDB;