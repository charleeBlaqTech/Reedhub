import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Chat from './components/Chat';  
import Admin from './components/Admin';

export default function App() {
  // Global states for token management and active view tracking
  const [token, setToken] = useState(localStorage.getItem('qa_token') || '');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('qa_user')) || null);
  const [currentView, setCurrentView] = useState(token ? 'feed' : 'login');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [activeChatPeerId, setActiveChatPeerId] = useState(null);

  // Synchronize authentication tokens to local storage elements
  useEffect(() => {
    if (token) {
      localStorage.setItem('qa_token', token);
      localStorage.setItem('qa_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qa_token');
      localStorage.removeItem('qa_user');
    }
  }, [token, currentUser]);

  // Global logout handler routine
  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setCurrentView('login');
    setViewingProfileId(null);
    setActiveChatPeerId(null);
  };

  // Dedicated navigation utility to route across component dashboards
  const navigateTo = (view, profileId = null) => {
    setCurrentView(view);
    // if (profileId) {
    //   setViewingProfileId(profileId);
    // }
    if (view === 'profile') setViewingProfileId(profileId);
    if (view === 'chat') setActiveChatPeerId(profileId);
  };

  return (
    <div id="app-root" className="min-h-screen bg-gray-50 text-gray-900 font-sans" data-testid="app-container">
      {/* Top Navigation Header bar rendered only for authenticated sessions */}
      {token && (
        <header id="main-header" className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="navbar">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 
              id="nav-logo" 
              className="text-xl font-bold tracking-tight text-indigo-600 cursor-pointer"
              data-testid="nav-brand-logo"
              onClick={() => navigateTo('feed')}
            >
              QA.Sandbox_
            </h1>
            <nav id="nav-links" className="flex items-center space-x-6" data-testid="nav-menu">
              <button 
                id="nav-btn-feed"
                className={`text-sm font-medium ${currentView === 'feed' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="link-global-feed"
                onClick={() => navigateTo('feed')}
              >
                Feed
              </button>
              <button 
                id="nav-btn-my-profile"
                className={`text-sm font-medium ${currentView === 'profile' && viewingProfileId === currentUser?.id ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="link-my-profile"
                onClick={() => navigateTo('profile', currentUser?.id)}
              >
                My Profile
              </button>
              <button 
                id="nav-btn-admin-panel"
                className={`text-sm font-semibold ${currentView === 'admin' ? 'text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="link-admin-panel"
                onClick={() => navigateTo('admin')}
              >
                Admin Terminal
              </button>
              <button 
                id="nav-btn-logout"
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md transition"
                data-testid="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Dynamic View Component Router Panel Selection Switch matrix */}
      <main id="main-content-window" className="max-w-5xl mx-auto p-4" data-testid="main-viewport">
        {currentView === 'login' && (
          <Login setToken={setToken} setCurrentUser={setCurrentUser} navigateTo={navigateTo} />
        )}
        {currentView === 'register' && (
          <Register navigateTo={navigateTo} />
        )}
        {currentView === 'feed' && (
          <Feed token={token} currentUser={currentUser} navigateTo={navigateTo} />
        )}
        {currentView === 'profile' && (
          <Profile token={token} currentUser={currentUser} viewingProfileId={viewingProfileId} setCurrentUser={setCurrentUser} navigateTo={navigateTo} />
        )}
        {currentView === 'chat' && (<Chat token={token} currentUser={currentUser} activeChatPeerId={activeChatPeerId} />)}

        {currentView === 'admin' && (
          <Admin token={token} currentUser={currentUser} navigateTo={navigateTo} />
        )}
      </main>
    </div>
  );
}