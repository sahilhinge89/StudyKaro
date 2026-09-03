const mongoose = require('mongoose');
require("dotenv").config();

exports.connectDB = async () =>{
   await mongoose.connect(process.env.MONGODB_URL);
    try {
        console.log("Database connected successfully")
    } catch(error){
        console.log("Database connection failed");
        console.error(error);
        process.exit(1);
    }
}