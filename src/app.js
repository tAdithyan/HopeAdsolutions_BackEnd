require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

let isConnected = false;

const connectDatabase = async () => {
    if (isConnected) return;

    try {
        await connectDB();
        isConnected = true;
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};



// app.use(cors({
//     origin: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));



app.use(cors({
    origin: 'https://www.hopeadsolutions.com', // only your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (safe version)
app.use('/uploads', express.static('uploads'));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(async (req, res, next) => {
    await connectDatabase();
    next();
});

app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to the Backend API');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);

    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: "File upload error",
            error: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
    console.log(`Network URL: http://192.168.1.4:${PORT}`);
    console.log(`Swagger docs: http://192.168.1.4:${PORT}/api-docs`);
});

module.exports = app;