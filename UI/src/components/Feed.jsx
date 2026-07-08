// src/components/Feed.jsx - Global Feed & Trending Dashboard
import React, { useState, useEffect } from 'react';

export default function Feed({ token, currentUser, navigateTo }) {
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [commentText, setCommentText] = useState({}); // Track individual comment inputs by post ID
  const [error, setError] = useState('');

  // Fetch chronological and highly liked trending feed streams simultaneously
  const fetchFeeds = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch timeline feed
      const timelineRes = await fetch('http://localhost:5000/api/posts', { headers });
      const timelineData = await timelineRes.json();
      if (timelineRes.ok) setPosts(timelineData);

      // Fetch sidebar ranking feed
      const trendingRes = await fetch('http://localhost:5000/api/posts/feed/liked', { headers });
      const trendingData = await trendingRes.json();
      if (trendingRes.ok) setTrendingPosts(trendingData.slice(0, 5)); // Restrict sidebar to top 5 entries
    } catch (err) {
      setError('Failed to fetch social feed payloads from backend.');
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [token]);

  // Handle post creation with text and multi-part binary images
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');

    // Prepare multipart payload structure for upload processing
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // Note: Browser sets Content-Type boundary parameters automatically
      });

      if (response.ok) {
        setContent('');
        setImageFile(null);
        // Clear file input element physically from DOM
        const fileInput = document.getElementById('post-file-upload');
        if (fileInput) fileInput.value = '';
        
        fetchFeeds(); // Refresh feed layouts
      } else {
        const data = await response.json();
        setError(data.error || 'Post distribution rejected by backend.');
      }
    } catch (err) {
      setError('Communication loss during creation lifecycle.');
    }
  };

  // Toggle liking metrics on arbitrary cards
  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchFeeds();
    } catch (err) {
      console.error('Like registration fault:', err);
    }
  };

  // Dispatch comments attached onto unique containers
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentText[postId] || '';
    if (!text.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        setCommentText({ ...commentText, [postId]: '' }); // Empty current target text block only
        fetchFeeds();
      }
    } catch (err) {
      console.error('Comment pipeline execution exception:', err);
    }
  };

  return (
    <div id="feed-view-layout" className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="feed-grid-layout">
      
      {/* LEFT & CENTER COLUMNS: Post Creator Box & Global Activity Cards */}
      <div id="timeline-column" className="md:col-span-2 space-y-6" data-testid="timeline-view">
        
        {error && (
          <div id="feed-error-banner" className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md" data-testid="feed-error-message">
            {error}
          </div>
        )}

        {/* POST COMPOSER INTERFACE BOX */}
        <div id="composer-card" className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm" data-testid="post-composer-box">
          <form id="composer-form" onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              id="txt-post-content"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
              rows="3"
              placeholder="What's on your mind? Share your thoughts or automated insights..."
              data-testid="textarea-post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <div id="composer-actions" className="flex items-center justify-between pt-2 border-t border-gray-50">
              <input 
                id="post-file-upload"
                type="file"
                accept="image/*"
                className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-5,0 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                data-testid="input-file-post-image"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              <button
                id="btn-submit-post"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-1.5 rounded-md shadow-sm transition"
                data-testid="btn-post-submit"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>

        {/* FEED CHRONOLOGICAL TIMELINE CONTAINER */}
        <div id="posts-feed-container" className="space-y-4" data-testid="global-posts-feed">
          {posts.length === 0 ? (
            <p id="empty-feed-txt" className="text-center py-12 text-sm text-gray-400 font-medium" data-testid="text-empty-feed">
              No write-ups published yet. Be the first to compose!
            </p>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id} 
                id={`post-card-${post.id}`} 
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                data-testid={`post-card-${post.id}`}
              >
                {/* Post Card Header Section */}
                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm cursor-pointer"
                      onClick={() => navigateTo('profile', post.authorId)}
                      data-testid={`avatar-author-${post.id}`}
                    >
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 
                        className="text-sm font-semibold hover:underline cursor-pointer text-gray-800"
                        onClick={() => navigateTo('profile', post.authorId)}
                        data-testid={`name-author-${post.id}`}
                      >
                        {post.authorName}
                      </h4>
                      {post.authorId !== currentUser?.id && (
                      <button
                        onClick={() => navigateTo('chat', post.authorId)}
                        className="text-[10px] ml-3 text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-md hover:bg-indigo-100 transition"
                        data-testid={`btn-initiate-chat-${post.id}`}
                      >
                        💬 Chat Direct
                      </button>
                      )}
                      <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                </div>

                {/* Post Body Content text and attachment fields */}
                <div className="p-4 space-y-3">
                  {post.content && (
                    <p className="text-sm text-gray-700 leading-relaxed" data-testid={`text-post-content-${post.id}`}>
                      {post.content}
                    </p>
                  )}
                  {post.imageUrl && (
                    <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-100 max-h-80 flex items-center justify-center">
                      <img 
                        src={`http://localhost:5000${post.imageUrl}`} 
                        alt="Post Attachment" 
                        className="object-contain max-h-80 w-full"
                        data-testid={`img-post-attachment-${post.id}`}
                      />
                    </div>
                  )}
                </div>

                {/* Like Count Bar Widget Hook */}
                <div className="px-4 py-2 bg-gray-50 flex items-center justify-between border-t border-b border-gray-100">
                  <button
                    id={`btn-like-${post.id}`}
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center space-x-2 text-xs font-semibold px-2 py-1 rounded transition ${post.likes.includes(currentUser?.id) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'}`}
                    data-testid={`btn-like-post-${post.id}`}
                  >
                    <span>👍 Like</span>
                    <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs font-bold" data-testid={`span-like-count-${post.id}`}>
                      {post.likes.length}
                    </span>
                  </button>
                  <span className="text-xs text-gray-400 font-medium" data-testid={`span-comment-count-${post.id}`}>
                    {post.comments.length} comments
                  </span>
                </div>

                {/* Render Embedded Sub-Comments Stream */}
                <div className="p-4 bg-gray-50/50 space-y-3 border-b border-gray-100">
                  {post.comments.map((cmt) => (
                    <div key={cmt.id} className="text-xs bg-white border border-gray-100 rounded-lg p-2.5 shadow-2xs" data-testid={`comment-block-${cmt.id}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700">{cmt.authorName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(cmt.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 leading-normal">{cmt.text}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Insertion Action Input Form */}
                <form onSubmit={(e) => handleAddComment(e, post.id)} className="p-3 bg-white flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add an interactive comment feedback..."
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    data-testid={`input-comment-text-${post.id}`}
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md font-medium transition"
                    data-testid={`btn-comment-submit-${post.id}`}
                  >
                    Send
                  </button>
                </form>

              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: "Most Liked Posts" Sidebar Widget Layout */}
      <div id="sidebar-column" className="space-y-4" data-testid="sidebar-trending-pane">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 id="sidebar-title" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3" data-testid="sidebar-heading">
            🔥 Most Liked Metrics
          </h3>
          <div className="space-y-3">
            {trendingPosts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No trending updates scored yet.</p>
            ) : (
              trendingPosts.map((tp, idx) => (
                <div 
                  key={tp.id} 
                  className="flex items-start space-x-2 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition"
                  onClick={() => navigateTo('profile', tp.authorId)}
                  data-testid={`trending-item-${idx}`}
                >
                  <span className="text-sm font-black text-indigo-500 w-4">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-gray-700 truncate">{tp.authorName}</h5>
                    <p className="text-xs text-gray-500 truncate italic">
                      {tp.content || "[Photo Writeup Attachment]"}
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">
                    👍 {tp.likes.length}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}