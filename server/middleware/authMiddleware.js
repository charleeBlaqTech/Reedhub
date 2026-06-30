// middleware/authMiddleware.js - Access Control Layer
const jwt = require('jsonwebtoken');

/**
 * Middleware to intercept requests and validate incoming JWT authorization headers
 * @bug INTENTIONAL QA LOOPHOLE: If the token is invalid, it catches the error but 
 *      returns a generic "500 Internal Server Error" instead of a proper "401 Unauthorized".
 *      This teaches testers to check for exact HTTP Status Code compliance!
 */
module.exports = function (req, res, next) {
  // Extract token from Authorization header (Format: Bearer <token>)
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is provided, reject request immediately
  if (!token) {
    return res.status(401).json({ error: "Access denied. No authentication token supplied." });
  }

  try {
    // Decode and verify the payload signature using the application secret passphrase
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Assign the decoded payload to the request lifecycle object
    req.user = decoded;
    
    // Pass control execution forward to the target route handler
    next();
  } catch (err) {
    // --- INTENTIONAL BUG REGION ---
    // Should be res.status(401).json({ error: "Invalid Token" });
    // Instead, we throw a 500 status code to confuse superficial test suites!
    res.status(500).json({ error: "Internal server error validation sequence exception." });
  }
};