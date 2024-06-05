const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbConnect = async() => {
    try {
        console.log("URL: ", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('MongoDB connection failed');
        process.exit(1);
    }
};

module.exports = dbConnect;