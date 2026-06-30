// db.js - Mock Database Engine for QA Practice Platform
const fs = require('fs');
const path = require('path');

// Define the file path where our mock database will persist records
const DB_FILE = path.join(__dirname, 'mock_db.json');

// Initial schema structure for our application data
const initialSchema = {
  users: [],
  posts: [],
  comments: []
};

/**
 * Reads the database state from the physical JSON file.
 * If the file doesn't exist, it initializes it with the default schema.
 */
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf8');
      return initialSchema;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, returning fresh instance:", error);
    return initialSchema;
  }
}

/**
 * Writes the updated database state back to the physical JSON file.
 */
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to commit write operation to mock DB:", error);
  }
}

// Database helper functions exported for route handlers
const db = {
  // --- USER OPERATIONS ---
  getUsers: () => readDB().users,
  
  findUserById: (id) => readDB().users.find(u => u.id === id),
  
  findUserByEmail: (email) => readDB().users.find(u => u.email === email),
  
  createUser: (userObject) => {
    const data = readDB();
    const newUser = {
      id: `usr_${Date.now()}`, // Simple scalable unique ID generation string
      friends: [],            // Array of user IDs representing friends
      createdAt: new Date().toISOString(),
      ...userObject
    };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },
  
  updateUser: (id, updatedFields) => {
    const data = readDB();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    // Intentionally merging fields cleanly
    data.users[index] = { ...data.users[index], ...updatedFields };
    writeDB(data);
    return data.users[index];
  },
  
  deleteUser: (id) => {
    const data = readDB();
    const userExists = data.users.some(u => u.id === id);
    if (!userExists) return false;
    
    data.users = data.users.filter(u => u.id !== id);
    // QA Loophole Hint: When deleting a user, we intentionally leave their posts/comments intact!
    // This creates an "Orphaned Records" bug that testers can discover when trying to render posts from deleted accounts.
    writeDB(data);
    return true;
  },

  // --- POST OPERATIONS ---
  getPosts: () => readDB().posts,
  
  findPostById: (id) => readDB().posts.find(p => p.id === id),
  
  createPost: (postObject) => {
    const data = readDB();
    const newPost = {
      id: `post_${Date.now()}`,
      likes: [], // Array of user IDs who liked this post
      createdAt: new Date().toISOString(),
      ...postObject
    };
    data.posts.push(newPost);
    writeDB(data);
    return newPost;
  },
  
  updatePost: (id, updatedFields) => {
    const data = readDB();
    const index = data.posts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    data.posts[index] = { ...data.posts[index], ...updatedFields };
    writeDB(data);
    return data.posts[index];
  },

  // --- COMMENT OPERATIONS ---
  getComments: () => readDB().comments,
  
  addComment: (commentObject) => {
    const data = readDB();
    const newComment = {
      id: `cmt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...commentObject
    };
    data.comments.push(newComment);
    writeDB(data);
    return newComment;
  }
};

module.exports = db;