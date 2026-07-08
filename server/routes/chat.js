// routes/chat.js - Chat Subsystem Router Engine
const express = require('express');
const db = require('../database');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/chat/:recipientId
 * @desc    Fetch chat history conversation with a specific peer user
 */
router.get('/:recipientId', auth, (req, res) => {
  try {
    const senderId = req.user.userId;
    const recipientId = req.params.recipientId;

    const allMessages = db.getMessages();
    
    // Filter chats exchanged between these two unique identifiers
    const conversation = allMessages.filter(m => 
      (m.senderId === senderId && m.recipientId === recipientId) ||
      (m.senderId === recipientId && m.recipientId === senderId)
    );

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to compile DM chat matrix records." });
  }
});

/**
 * @route   POST /api/chat
 * @desc    Send a private message string to a platform user
 * @bug     INTENTIONAL SECURITY LOOPHOLE: This chat pipeline doesn't check if the recipient 
 *          is actually a friend, or if the recipient exists at all. Students can send blank messages 
 *          or write automation loops to spam arbitrary data fields!
 */
router.post('/', auth, (req, res) => {
  try {
    const senderId = req.user.userId;
    const { recipientId, message } = req.body;

    const sender = db.findUserById(senderId);

    const newMessage = db.createMessage({
      senderId,
      senderName: sender ? sender.name : "System User",
      recipientId,
      message: message || "" // Missing validation flaw allows empty text strings to persist
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Transmission layer failure inside chat framework." });
  }
});

module.exports = router;