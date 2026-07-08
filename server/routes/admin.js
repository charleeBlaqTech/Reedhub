// routes/admin.js - Control Console Panel Administrative Router
const express = require('express');
const db = require('../database');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/admin/logs
 * @desc    View systemic internal action logs
 * @bug     CRITICAL ARBITRARY ACCESS BUG: While protected by the standard token validation layer, 
 *          this endpoint fails to check if the user account actually possesses an admin role! 
 *          Any standard student tester account can query this endpoint to view complete system history.
 */
router.get('/logs', auth, (req, res) => {
  try {
    // --- INTENTIONAL SECURITY MISSING CHECK ---
    // A robust build requires checking user roles: 
    // const executingUser = db.findUserById(req.user.userId);
    // if (executingUser.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    const systemLogs = db.getLogs();
    res.status(200).json(systemLogs.reverse());
  } catch (error) {
    res.status(500).json({ error: "Could not compile audit track sequences." });
  }
});

/**
 * @route   POST /api/admin/announcement
 * @desc    Log a broad diagnostic broadcast flag
 */
router.post('/announcement', auth, (req, res) => {
  try {
    const { message } = req.body;
    db.logAction(req.user.userId, "SYSTEM_BROADCAST", message);
    res.status(201).json({ message: "Diagnostic alert distributed cleanly into data log stream." });
  } catch (error) {
    res.status(500).json({ error: "Internal crash logged on management terminal pipeline." });
  }
});

module.exports = router;