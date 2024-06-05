const express = require('express');
const cors = require('cors');
const connectDB = require('./Utils/dbconnect');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/user', require('./Routes/user'));
app.use('/api/employee', require('./Routes/employees'));
app.use('/api/assignment', require('./Routes/assignment'));
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/terms', require('./Routes/terms'));
app.use('/api/package', require('./Routes/package'));
app.use('/api/aggriment', require("./Routes/Agriment"));
// Default route
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});