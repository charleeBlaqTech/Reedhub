// routes/auth.js - Authentication Router (Register & Login)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database'); // Import our custom mock database file engine

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @bug     INTENTIONAL QA LOOPHOLE: This endpoint completely skips validating if the email is 
 *          already registered in the system. Students can create duplicate accounts with the 
 *          same email address, breaking standard unique constraint assumptions!
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- INTENTIONAL BUG REGION ---
    // Standard robust code would have a check here like:
    // const existingUser = db.findUserByEmail(email);
    // if (existingUser) return res.status(400).json({ error: "Email already exists" });
    // we bypass this completely to let your testers find the flaw.

    // Hash the password for security simulation using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user object schema profile
    const newUser = db.createUser({
      name,
      email,
      password: hashedPassword, // Store securely hashed password
      bio: "Hello, I am practicing QA testing!", // Default fallback bio
      avatar: "" // Default empty avatar string
    });

    // Exclude the password field from the returning JSON payload object safely
    const { password: _, ...userResponse } = newUser;

    // Return successful creation response
    res.status(201).json({
      message: "User registered successfully!",
      user: userResponse
    });
  } catch (error) {
    // Standard fallback catch-all block
    res.status(500).json({ error: "Internal Server Error occurred on the backend service." });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and issue a session JWT token
 * @bug     SECONDARY INTENTIONAL FLAW: Because of the duplicate email bug above, db.findUserByEmail 
 *          will return the FIRST record matching that email. If a second user registers with the 
 *          same email but a different password, they can never log in because the engine checks the first user's password!
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up user by email template match
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials supplied to authorization endpoint." });
    }

    // Compare the raw input password against the securely stored hashed password string
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials supplied to authorization endpoint." });
    }

    // Generate a secure JWT Session token using the environmental variable configuration secret key
    // QA Hidden Flaw: We are omitting an expiry time configuration parameter (e.g., expiresIn: '1h').
    // This token stays valid forever, representing a token persistence security bug!
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET
    );

    // Filter structural properties to avoid sending the raw hash down the pipeline
    const { password: _, ...userResponse } = user;

    // Dispatch the successful auth payload back down to the frontend user client layer
    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error occurred during login processing sequence." });
  }
});

module.exports = router;