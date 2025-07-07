const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const journalRoutes = require('./src/routes/journal');
const communityRoutes = require('./src/routes/community');
const chatbotRoutes = require('./src/routes/chatbot');
const insightsRoutes = require('./src/routes/insights');
const manifestationRoutes = require('./src/routes/manifestation');
const affirmationRoutes = require('./src/routes/affirmation');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/journal_app')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/manifestation', manifestationRoutes);
app.use('/api/affirmation', affirmationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
res.json({
status: 'OK',
message: 'Journal API is running! 🌸',
timestamp: new Date().toISOString(),
port: PORT,
environment: process.env.NODE_ENV
});
});

// Simple test endpoint
app.get('/test', (req, res) => {
res.json({
message: 'Backend is working! 🌸',
timestamp: new Date().toISOString()
});
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).json({
error: 'Something went wrong! 💔',
message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
});
});

// 404 handler
app.use('*', (req, res) => {
res.status(404).json({
error: 'Route not found! 🌸',
message: 'The requested endpoint does not exist'
});
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
console.log(`🌸 Journal API server running on port ${PORT}`);
console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});