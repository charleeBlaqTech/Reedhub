// routes/users.js - User Management Router (Profile Read, Update, Delete & Friends)
const express = require('express');
const db = require('../database'); // Reference our custom file-persisted mock database engine
const auth = require('../middleware/authMiddleware'); // Protect endpoints with our validation layer

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Fetch a user's profile information by ID
 */
router.get('/:id', auth, (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User account profile not found." });
    }

    // Strip password hash string prior to return shipment
    const { password: _, ...profileData } = user;
    res.status(200).json(profileData);
  } catch (error) {
    res.status(500).json({ error: "Failed to extract profile records." });
  }
});


router.get('/',auth, (req, res) => {
  try {
    const users = db.getUsers();
    if (!users) {
      return res.status(404).json({ error: "Users not found." });
    }

    // Strip password hash string prior to return shipment
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to extract profile records." });
  }
});
/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile data (name, bio, avatar)
 * @bug     INTENTIONAL IDOR/BOLA BUG: Notice that while we pass the request through 'auth' middleware,
 *          we NEVER verify if the logged-in user (req.user.userId) matches the user ID in the URL parameter (req.params.id).
 *          Any authenticated user can overwrite ANY other user's profile variables!
 */
router.put('/:id', auth, (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { name, bio, avatar } = req.body;

    // Verify target account exists inside system space
    const userExists = db.findUserById(targetUserId);
    if (!userExists) {
      return res.status(404).json({ error: "Target profile account not found." });
    }

    // --- CRITICAL IDOR BUG HOOPHOLE ---
    // Robust code would demand: if(req.user.userId !== targetUserId) return res.status(403);
    // Bypassing authorization comparison completely below:
    const updatedUser = db.updateUser(targetUserId, { name, bio, avatar });

    const { password: _, ...responseFields } = updatedUser;
    res.status(200).json({
      message: "Profile updated successfully!",
      user: responseFields
    });
  } catch (error) {
    res.status(500).json({ error: "Critical internal application error while modifying profile fields." });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Permanently delete a user profile account from system space
 * @bug     INTENTIONAL IDOR/BOLA BUG: Same as update, anyone with a valid token can drop an API call 
 *          and destroy another student's account profile without ownership validation.
 */
router.delete('/:id', auth, (req, res) => {
  try {
    const targetUserId = req.params.id;

    // --- CRITICAL IDOR BUG HOOPHOLE ---
    // Bypassing authentication ownership verification checks again
    const executionOutcome = db.deleteUser(targetUserId);

    if (!executionOutcome) {
      return res.status(404).json({ error: "Target profile account not found or already purged." });
    }

    res.status(200).json({ message: "User account profile completely purged from mock system database environment." });
  } catch (error) {
    res.status(500).json({ error: "Internal processing exception occurred during user destruction sequence." });
  }
});

/**
 * @route   POST /api/users/friend/:friendId
 * @desc    Add a user to the active user's friends list array
 * @bug     INTENTIONAL LOGIC BUG: This system does not check if the friendId is valid, nor does it block 
 *          friending yourself! Testers can add themselves as their own friend or inject dummy strings into the array.
 */
router.post('/friend/:friendId', auth, (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const targetedFriendId = req.params.friendId;

    // Extract current requester profile configuration
    const user = db.findUserById(currentUserId);
    
    // --- INTENTIONAL FRIEND LOGIC FLUX ---
    // Code skips checking if targetedFriendId exists or if currentUserId === targetedFriendId
    
    // Avoid appending double duplicates cleanly
    if (!user.friends.includes(targetedFriendId)) {
      user.friends.push(targetedFriendId);
      db.updateUser(currentUserId, { friends: user.friends });
    }

    res.status(200).json({
      message: "Friend relationship linked successfully.",
      friendsList: user.friends
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanly link user friend structure identifiers." });
  }
});

module.exports = router;