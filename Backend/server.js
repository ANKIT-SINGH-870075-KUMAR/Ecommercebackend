import app  from "./app.js";
import dotenv  from "dotenv";
import connectToMongo  from "./config/database.js";
import cloudinary  from 'cloudinary';

//handling Uncaught Exception 
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`); 
    console.log("Shutting down the server due to uncaught Exception");
    process.exit(1);
})

//config
dotenv.config({ path: "backend/config/config.env" });

//connecting to database
connectToMongo();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

//unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });

});