// server.js - Central entry point for the QA Practice Testing Backend API
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Initialize environment configuration options
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cross-Origin Resource Sharing (CORS) middle tier middleware
// This ensures our React frontend running on another port can hit these endpoints smoothly
app.use(cors());

// Configure middleware to parse incoming application/json body structural payloads
app.use(express.json());

// Expose a public folder directory statically to serve user-uploaded small pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add this right beneath your app.use(express.json()); middleware block:
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));  
app.use('/api/admin', require('./routes/admin')); 


// Simple baseline health-check endpoint route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "QA Practice API engine is online and accepting connections",
    timestamp: new Date().toISOString()
  });
});


// Start listening for network operations
app.listen(PORT, () => {
  console.log(`Server running smoothly on interface port: ${PORT}`);
});