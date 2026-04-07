require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const jobRoutes = require('./routes/jobs');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Middleware
const allowedOrigins = [
    'https://role-based-web-mern.vercel.app',
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Job Matcher API is running...',
        timestamp: new Date().toISOString()
    });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('--- Startup Configuration ---');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI ? 'Defined (HIDDEN)' : 'NOT DEFINED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'NOT DEFINED');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Defined' : 'NOT DEFINED');
console.log('----------------------------');

const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from environment variables');
        }

        console.log('⏳ Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });

        server.on('error', (err) => {
            console.error('❌ Server startup error:', err);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ CRITICAL ERROR during startup:');
        console.error(error);
        process.exit(1);
    }
};

// Handle process-wide errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

connectDB();
