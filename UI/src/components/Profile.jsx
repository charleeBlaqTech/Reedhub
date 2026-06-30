// src/components/Profile.jsx - Profile Dashboard, Management, & Friend Interface
import React, { useState, useEffect } from 'react';

export default function Profile({ token, currentUser, viewingProfileId, setCurrentUser, navigateTo }) {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatar: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Extract primary profile records and filter global posts for user matching items
  const fetchProfileData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch specific user profile metrics
      const profileRes = await fetch(`http://localhost:5000/api/users/${viewingProfileId}`, { headers });
      const profileData = await profileRes.json();
      
      if (profileRes.ok) {
        setProfile(profileData);
        setEditForm({ name: profileData.name, bio: profileData.bio, avatar: profileData.avatar || '' });
      } else {
        setError(profileData.error || 'Failed to extract targeted profile metadata parameters.');
      }

      // Fetch global posts and filter down locally to match this specific author
      const postsRes = await fetch('http://localhost:5000/api/posts', { headers });
      const postsData = await postsRes.json();
      if (postsRes.ok) {
        const filtered = postsData.filter(p => p.authorId === viewingProfileId);
        setUserPosts(filtered);
      }
    } catch (err) {
      setError('Loss of stable connection to host application layer.');
    }
  };

  useEffect(() => {
    if (viewingProfileId) {
      fetchProfileData();
    }
  }, [viewingProfileId, token]);

  // Submit profile mutations to backend service
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // --- ATTENTION QA INSTRUCTORS ---
      // This payload sends to /api/users/:id. Due to the backend IDOR vulnerability, 
      // your students can change the viewingProfileId in their automated script to a different user's ID,
      // and successfully overwrite another person's profile details!
      const response = await fetch(`http://localhost:5000/api/users/${viewingProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Profile metrics updated successfully inside mock database system.');
        setIsEditing(false);
        setProfile(data.user);
        
        // If updating the logged-in user's own profile, synchronize the state
        if (currentUser.id === viewingProfileId) {
          setCurrentUser(data.user);
        }
      } else {
        setError(data.error || 'Profile update request rejected.');
      }
    } catch (err) {
      setError('Communication exception thrown modifying profile records.');
    }
  };

  // Permanently destroy the targeted user profile account container
  const handleDeleteProfile = async () => {
    const confirmation = window.confirm("CRITICAL WARNING: Are you sure you want to permanently purge this account record space?");
    if (!confirmation) return;

    try {
      // --- IDOR VULNERABILITY TRAP ---
      // Any valid token user can trigger this API path against any target :id parameter string!
      const response = await fetch(`http://localhost:5000/api/users/${viewingProfileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Account successfully terminated.');
        
        // If the student deletes their own profile, log them out automatically
        if (currentUser.id === viewingProfileId) {
          document.getElementById('nav-btn-logout').click();
        } else {
          navigateTo('feed');
        }
      } else {
        setError(data.error || 'Destruction routine intercepted or rejected.');
      }
    } catch (err) {
      setError('Failed to securely forward profile deletion requests.');
    }
  };

  // Add friend relationship handler
  const handleAddFriend = async () => {
    setMessage('');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/users/friend/${viewingProfileId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Friend relationship mapped successfully.');
        fetchProfileData(); // Refresh current metrics count
      } else {
        setError(data.error || 'Friend request allocation mapping fault.');
      }
    } catch (err) {
      setError('Friend execution logic failed due to transmission loss.');
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-24" data-testid="profile-loading-fallback">
        <p className="text-sm font-medium text-gray-400">Loading user profile configuration data stream...</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === viewingProfileId;

  return (
    <div id="profile-container-view" className="max-w-3xl mx-auto space-y-6" data-testid="profile-view-wrapper">
      
      {/* SUCCESS / ERROR ALERTS FOR AUTOMATION TRACKING */}
      {message && (
        <div id="profile-success-banner" className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md" data-testid="profile-success-message">
          {message}
        </div>
      )}
      {error && (
        <div id="profile-error-banner" className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md" data-testid="profile-error-message">
          {error}
        </div>
      )}

      {/* CORE PROFILE INFRASTRUCTURE CARD */}
      <div id="profile-identity-card" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4" data-testid="profile-meta-card">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div id="profile-avatar-graphic" className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-inner" data-testid="profile-avatar-letter">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 id="profile-display-name" className="text-xl font-bold text-gray-800" data-testid="profile-name-text">{profile.name}</h2>
            <p id="profile-display-email" className="text-xs font-mono text-gray-400" data-testid="profile-email-text">{profile.email}</p>
            <p id="profile-display-bio" className="text-sm text-gray-600 max-w-md pt-1" data-testid="profile-bio-text">
              {profile.bio || "No professional profile synopsis summary written yet."}
            </p>
            <div className="pt-2 flex items-center gap-3 justify-center sm:justify-start">
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded" data-testid="friend-count-badge">
                👥 {profile.friends ? profile.friends.length : 0} Friends
              </span>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded" data-testid="post-count-badge">
                📝 {userPosts.length} Posts Published
              </span>
            </div>
          </div>
        </div>

        {/* MANAGEMENT INTERACTIVE ACTION CONSOLE PANEL */}
        <div id="profile-actions-panel" className="flex sm:flex-col gap-2 w-full sm:w-auto" data-testid="profile-actions-hub">
          {!isOwnProfile && (
            <button
              id="btn-action-friend"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs transition"
              data-testid="btn-add-friend"
              onClick={handleAddFriend}
            >
              ➕ Link Friend Connection
            </button>
          )}
          
          {/* Admin rights simulation toggle panel buttons */}
          <button
            id="btn-action-edit-toggle"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-md transition"
            data-testid="btn-toggle-edit-mode"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Modifications' : '🔧 Modify Account Details'}
          </button>
          
          <button
            id="btn-action-destroy-account"
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-md transition"
            data-testid="btn-delete-profile"
            onClick={handleDeleteProfile}
          >
            🚨 Terminate Profile Account
          </button>
        </div>
      </div>

      {/* CONDITIONAL RENDER PROFILE RECONSTRUCTION EDIT FORM BOX */}
      {isEditing && (
        <div id="edit-form-card" className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-6 shadow-2xs" data-testid="edit-profile-form-box">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-4">Modify Target Account Profile Matrix</h3>
          <form id="profile-edit-form" onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alter Display Name String</label>
              <input
                type="text"
                required
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="input-edit-profile-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rewrite Bio Narrative Context</label>
              <textarea
                rows="2"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="textarea-edit-profile-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-md shadow-sm transition"
              data-testid="btn-save-profile-modifications"
            >
              Commit Updates Downstream
            </button>
          </form>
        </div>
      )}

      {/* USER PERSONAL TIMELINE STREAM REPLICATOR CARD LAYOUT */}
      <div id="user-posts-container" className="space-y-4" data-testid="user-profile-posts-list">
        <h3 id="user-timeline-header" className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1" data-testid="profile-posts-heading">
          Personal Output Stream
        </h3>
        {userPosts.length === 0 ? (
          <p className="text-center py-12 text-xs text-gray-400 bg-white border border-gray-200 rounded-xl" data-testid="text-no-user-posts">
            This account user has not distributed any post modules onto the platform workspace yet.
          </p>
        ) : (
          userPosts.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3" data-testid={`user-post-card-${post.id}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Post Identifier Ref: {post.id}</span>
                <span className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              {post.content && <p className="text-sm text-gray-700">{post.content}</p>}
              {post.imageUrl && (
                <img 
                  src={`http://localhost:5000${post.imageUrl}`} 
                  className="max-h-60 rounded border border-gray-100 object-cover" 
                  alt="Profile Attachment" 
                />
              )}
              <div className="pt-2 text-xs text-indigo-600 font-semibold">
                👍 Received {post.likes.length} Interactions · 💬 Carries {post.comments.length} Nested Remarks
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}