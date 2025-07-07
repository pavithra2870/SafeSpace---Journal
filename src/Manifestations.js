import React, { useState, useEffect, useMemo } from 'react';
import './Manifestations.css';

const API_BASE_URL = 'http://localhost:5001/api/manifestation';

const Manifestations = () => {
  const [manifestations, setManifestations] = useState([]);
  const [newManifestation, setNewManifestation] = useState({ text: '', category: 'personal', priority: 'medium' });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Manifestations', icon: '🌟' },
    { id: 'personal', name: 'Personal Growth', icon: '🌱' },
    { id: 'career', name: 'Career & Success', icon: '💼' },
    { id: 'relationships', name: 'Relationships', icon: '💕' },
    { id: 'health', name: 'Health & Wellness', icon: '🏃‍♀️' },
    { id: 'financial', name: 'Financial Abundance', icon: '💰' },
    { id: 'spiritual', name: 'Spiritual Growth', icon: '🧘‍♀️' },
    { id: 'travel', name: 'Travel & Adventure', icon: '✈️' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#10b981' },
    { id: 'medium', name: 'Medium', color: '#f59e0b' },
    { id: 'high', name: 'High', color: '#ef4444' }
  ];

  // Fetch manifestations
  useEffect(() => {
    const fetchManifestations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_BASE_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch data.');
        const data = await res.json();
        setManifestations(data.success ? data.data : []);
      } catch (err) {
        setError(err.message);
        setManifestations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchManifestations();
  }, []);

  // Add a manifestation
  const addManifestation = async (e) => {
    e.preventDefault();
    if (!newManifestation.text.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newManifestation.text.trim(),
          category: newManifestation.category,
          priority: newManifestation.priority
        })
      });
      const data = await res.json();
      if (data.success) {
        setManifestations([data.data, ...manifestations]);
        setNewManifestation({ text: '', category: 'personal', priority: 'medium' });
      }
    } catch (err) {
      console.error("Failed to add manifestation:", err);
    }
  };

  // Toggle fulfilled status
  const toggleFulfilled = async (manifestationId) => {
    const manifestation = manifestations.find(m => m._id === manifestationId);
    if (!manifestation) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/${manifestationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fulfilled: !manifestation.fulfilled })
      });
      const data = await res.json();
      if (data.success) {
        setManifestations(manifestations.map(m => m._id === manifestationId ? data.data : m));
      }
    } catch (err) {
      console.error("Failed to toggle fulfillment:", err);
    }
  };

  // Delete a manifestation
  const deleteManifestation = async (manifestationId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/${manifestationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setManifestations(manifestations.filter(m => m._id !== manifestationId));
      }
    } catch (err) {
      console.error("Failed to delete manifestation:", err);
    }
  };

  // Memoized sorting and filtering
  const sortedManifestations = useMemo(() => {
    const filtered = filter === 'all' 
      ? manifestations 
      : manifestations.filter(m => m.category === filter);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'fulfilled':
          return (a.fulfilled === b.fulfilled) ? 0 : a.fulfilled ? 1 : -1;
        default:
          return 0;
      }
    });
  }, [manifestations, filter, sortBy]);

  const fulfilledCount = manifestations.filter(m => m.fulfilled).length;
  const totalCount = manifestations.length;
  const fulfillmentRate = totalCount > 0 ? Math.round((fulfilledCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="manifestations-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your manifestations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="manifestations-container">
      <div className="manifestations-header">
        <div className="header-content">
          <h1 className="manifestations-title font-handwriting">
            <span className="title-icon">🌟</span>
            Manifestations
          </h1>
          <p className="manifestations-subtitle">
            Write your dreams into reality and track your journey to fulfillment
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-icon">✨</span>
            <div className="stat-info">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-number">{fulfilledCount}</span>
              <span className="stat-label">Fulfilled</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-number">{fulfillmentRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="manifestations-content">
        <div className="manifestations-sidebar">
          <div className="sidebar-section">
            <h3 className="section-title">Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-item ${filter === category.id ? 'active' : ''}`}
                  onClick={() => setFilter(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Sort By</h3>
            <div className="sort-options">
              <button
                className={`sort-option ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => setSortBy('date')}
              >
                <span className="sort-icon">📅</span>
                Date Added
              </button>
              <button
                className={`sort-option ${sortBy === 'priority' ? 'active' : ''}`}
                onClick={() => setSortBy('priority')}
              >
                <span className="sort-icon">🎯</span>
                Priority
              </button>
              <button
                className={`sort-option ${sortBy === 'fulfilled' ? 'active' : ''}`}
                onClick={() => setSortBy('fulfilled')}
              >
                <span className="sort-icon">✅</span>
                Status
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Manifestation Tips</h3>
            <div className="tips">
              <div className="tip-item">
                <span className="tip-icon">💭</span>
                <span className="tip-text">Write in present tense as if already achieved</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span className="tip-text">Be specific and detailed in your manifestations</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🙏</span>
                <span className="tip-text">Express gratitude for what you're manifesting</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔮</span>
                <span className="tip-text">Visualize and feel the emotions of having it</span>
              </div>
            </div>
          </div>
        </div>

        <div className="manifestations-main">
          <div className="create-manifestation-section">
            <div className="create-manifestation-card">
              <h3 className="create-manifestation-title">Create New Manifestation</h3>
              <form onSubmit={addManifestation} className="create-manifestation-form">
                <textarea
                  placeholder="Write your manifestation here... (e.g., 'I am living in my dream home with a beautiful garden')"
                  value={newManifestation.text}
                  onChange={(e) => setNewManifestation({...newManifestation, text: e.target.value})}
                  className="manifestation-input"
                  rows={3}
                  maxLength={300}
                />
                <div className="form-row">
                  <select
                    value={newManifestation.category}
                    onChange={(e) => setNewManifestation({...newManifestation, category: e.target.value})}
                    className="category-select"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newManifestation.priority}
                    onChange={(e) => setNewManifestation({...newManifestation, priority: e.target.value})}
                    className="priority-select"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name} Priority
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <span className="char-count">
                    {newManifestation.text.length}/300 characters
                  </span>
                  <button type="submit" className="submit-manifestation-btn">
                    <span className="btn-icon">✨</span>
                    Manifest
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="manifestations-list-section">
            <div className="section-header">
              <h3 className="section-title">
                {filter === 'all' ? 'All Manifestations' : categories.find(c => c.id === filter)?.name}
              </h3>
              <span className="manifestations-count">{sortedManifestations.length} manifestations</span>
            </div>

            <div className="manifestations-list">
              {sortedManifestations.map(manifestation => (
                <div key={manifestation._id} className={`manifestation-card ${manifestation.fulfilled ? 'fulfilled' : ''}`}>
                  <div className="manifestation-content">
                    <div className="manifestation-header">
                      <div className="manifestation-info">
                        <span className="category-badge">
                          {categories.find(c => c.id === manifestation.category)?.icon}
                          {categories.find(c => c.id === manifestation.category)?.name}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: priorities.find(p => p.id === manifestation.priority)?.color }}
                        >
                          {manifestation.priority} Priority
                        </span>
                      </div>
                      <div className="manifestation-date">
                        {new Date(manifestation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className={`manifestation-text ${manifestation.fulfilled ? 'strikethrough' : ''}`}>
                      {manifestation.title}
                    </p>
                    
                    {manifestation.fulfilled && manifestation.fulfilledDate && (
                      <div className="fulfillment-info">
                        <span className="fulfillment-icon">🎉</span>
                        <span className="fulfillment-text">
                          Fulfilled on {new Date(manifestation.fulfilledDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="manifestation-actions">
                    <button
                      className={`action-btn fulfill-btn ${manifestation.fulfilled ? 'fulfilled' : ''}`}
                      onClick={() => toggleFulfilled(manifestation._id)}
                      title={manifestation.fulfilled ? 'Mark as unfulfilled' : 'Mark as fulfilled'}
                    >
                      <span className="action-icon">
                        {manifestation.fulfilled ? '✅' : '⭕'}
                      </span>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteManifestation(manifestation._id)}
                      title="Delete manifestation"
                    >
                      <span className="action-icon">🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {sortedManifestations.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🌟</div>
                <h3 className="empty-title">No manifestations yet</h3>
                <p className="empty-text">
                  Start manifesting your dreams by creating your first manifestation above!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manifestations;
