// routes/posts.js - Social Media Engine (Posts, Likes, Comments)
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database'); // Reference our custom mock database engine
const auth = require('../middleware/authMiddleware'); // Import token verification guard

const router = express.Router();

// --- CONFIGURING MULTER STORAGE FOR SMALL PICTURES ---
const storage = multer.diskStorage({
  // Direct multer to dump files safely into our server side uploads directory
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  // Keep original filename signatures with a clean current timestamp prefix
  filename: (req, file, cb) => {
    cb(null, `img_${Date.now()}_${file.originalname}`);
  }
});

// Initialize multer middleware instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Constrain to 2MB maximum image file sizes
});

/**
 * @route   POST /api/posts
 * @desc    Create a new write-up post with an optional small picture
 * @bug     INTENTIONAL VALIDATION BUG: This code completely omits text/file verification checks.
 *          Students can hit this with an entirely empty payload (no text content, no image file)
 *          and the backend will accept it as valid, breaking database layout expectations!
 */
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    const { content } = req.body;
    const authorId = req.user.userId;
    
    // Retrieve author details to pin their profile name onto the post card metadata
    const author = db.findUserById(authorId);

    // Capture uploaded file system web paths cleanly if it exists
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // --- INTENTIONAL LOGIC GAP REGION ---
    // Standard robust platforms would enforce: 
    // if (!content && !imageUrl) return res.status(400).json({ error: "Post cannot be empty" });
    // We intentionally bypass this check entirely.

    const newPost = db.createPost({
      authorId,
      authorName: author ? author.name : "Unknown Tester",
      content: content || "", // Fallback to empty string if missing
      imageUrl,
      likes: [], // Initiates with an empty array of user IDs
      comments: [] // Initiates empty array of comment objects
    });

    res.status(201).json({
      message: "Post created successfully!",
      post: newPost
    });
  } catch (error) {
    res.status(500).json({ error: "Exception caught creating a post container." });
  }
});

/**
 * @route   GET /api/posts
 * @desc    Fetch ALL posts globally in chronological order
 */
router.get('/', auth, (req, res) => {
  try {
    // Reverse array to ensure newest posts appear at the top of feed pipelines
    const allPosts = [...db.getPosts()].reverse();
    res.status(200).json(allPosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to extract post elements." });
  }
});

/**
 * @route   GET /api/posts/feed/liked
 * @desc    Fetch top trending posts sorted primarily by maximum total like arrays
 */
router.get('/feed/liked', auth, (req, res) => {
  try {
    const allPosts = db.getPosts();
    // Sort array by length of likes descendingly
    const highlyLiked = [...allPosts].sort((a, b) => b.likes.length - a.likes.length);
    res.status(200).json(highlyLiked);
  } catch (error) {
    res.status(500).json({ error: "Failed to sort hot-trending feed layouts." });
  }
});

/**
 * @route   POST /api/posts/:id/like
 * @desc    Toggle a like on a post container
 */
router.post('/:id/like', auth, (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = db.findPostById(postId);
    if (!post) return res.status(404).json({ error: "Target post not found." });

    // Simple toggle calculation matrix
    if (post.likes.includes(userId)) {
      // Remove user from like array list if already present
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Inject user ID to like tracking stack array
      post.likes.push(userId);
    }

    const updatedPost = db.updatePost(postId, { likes: post.likes });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Like calculation matrix execution failed." });
  }
});

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Append an arbitrary text comment string onto a post
 */
router.post('/:id/comment', auth, (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const { text } = req.body;

    const post = db.findPostById(postId);
    if (!post) return res.status(404).json({ error: "Target post not found." });

    const user = db.findUserById(userId);

    const newComment = {
      id: `cmt_${Date.now()}`,
      authorId: userId,
      authorName: user ? user.name : "Anonymous Tester",
      text: text || "",
      createdAt: new Date().toISOString()
    };

    // Push the comment payload directly into the target post's nested collection array
    post.comments.push(newComment);
    const updatedPost = db.updatePost(postId, { comments: post.comments });

    res.status(201).json({
      message: "Comment saved successfully.",
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanly persist comment record structural parameters." });
  }
});

module.exports = router;