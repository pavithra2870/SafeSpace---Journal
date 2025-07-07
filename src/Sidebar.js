import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom"; // Removed useParams as it's not needed
import './Sidebar.css';
// Assuming you have a CSS file for styles, if using Tailwind primarily, you might not need this.
// import './output.css'; 
// import './App.css';

const Sidebar = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Memoize menu items to prevent re-creation on every render, especially if user object changes frequently.
  const menuItems = React.useMemo(() => [
    { path: `/${user?.username}`, icon: '🏠', label: 'Dashboard', description: 'Your personal space' },
    { path: `/${user?.username}/entry`, icon: '📝', label: 'My Journals', description: 'Write and manage entries' },
    { path: `/${user?.username}/insights`, icon: '📊', label: 'Insights', description: 'Analytics & progress' },
    { path: `/${user?.username}/community`, icon: '🏘️', label: 'Community', description: 'Connect with others' },
    { path: `/${user?.username}/affirmations`, icon: '✨', label: 'Affirmations', description: 'Daily positive thoughts' },
    { path: `/${user?.username}/manifestations`, icon: '🌟', label: 'Manifestations', description: 'Dreams & goals' },
    { path: '/features', icon: '🚀', label: 'Features', description: 'App capabilities' },
    { path: '/contact', icon: '📞', label: 'Contact', description: 'Get in touch' }
  ], [user?.username]); // Dependency array ensures it only updates when username changes.

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🌸</span>
          {!isCollapsed && (
            <span className="logo-text font-handwriting">SafeSpace</span>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <span className={`collapse-icon ${isCollapsed ? 'expanded' : ''}`}>
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* --- This conditional wrapper is crucial. It ensures the profile and level only render if 'user' exists --- */}
      {user && (
        <>
          <div className="user-profile">
            <div className="user-avatar">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="h-12 w-12 rounded-full mx-auto border-2 border-pink-300"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-300 to-green-300 flex items-center justify-center text-pink-700 font-bold text-lg mx-auto border-2 border-pink-300">
                  {/* Using optional chaining for extra safety */}
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <h3 className="user-name font-handwriting">{user.username}</h3>
                <div className="user-stats">
                  <span className="stat">
                    <span className="stat-icon">⭐</span>
                    {user.points || 0}
                  </span>
                  <span className="stat">
                    <span className="stat-icon">🔥</span>
                    {user.streak || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* === THE FIX: This entire block is now inside the 'user' check === */}
          <div className="level-progress">
            <div className="level-info">
              {/* Use optional chaining 'user?.level' for safety */}
              <span className="level-text">Level {user?.level || 1}</span>
              <span className="progress-text">{user?.progressToNextLevel || 0}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${user?.progressToNextLevel || 0}%` }}
              ></div>
            </div>
          </div>
        </>
      )}

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link
                // Disable link if it requires a user and none is logged in
                to={item.path.includes('undefined') ? '#' : item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
                // Prevent clicking on invalid links
                onClick={(e) => item.path.includes('undefined') && e.preventDefault()}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                {isActive(item.path) && (
                  <div className="active-indicator"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- This logout button also needs to be inside a conditional check --- */}
      {user && (
        <div className="sidebar-footer">
          <button 
            onClick={onLogout}
            className="logout-btn"
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className="logout-icon">🚪</span>
            {!isCollapsed && <span className="logout-text">Logout</span>}
          </button>
        </div>
      )}

      <div className="sidebar-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Sidebar;
