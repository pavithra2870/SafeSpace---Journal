import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [filter, setFilter] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: "How journaling helped me overcome anxiety",
        content: "I started journaling 6 months ago and it's been a game-changer for my mental health. The daily practice of writing down my thoughts has helped me identify patterns and triggers...",
        author: "MindfulWriter",
        category: "mental-health",
        likes: 127,
        comments: 23,
        timestamp: "2 hours ago",
        avatar: "🧘‍♀️",
        isLiked: false
      },
      {
        id: 2,
        title: "My gratitude practice transformed my life",
        content: "Every morning, I write down 3 things I'm grateful for. This simple practice has shifted my entire perspective on life. Even on bad days, I can always find something to appreciate...",
        author: "GratefulSoul",
        category: "gratitude",
        likes: 89,
        comments: 15,
        timestamp: "5 hours ago",
        avatar: "🙏",
        isLiked: true
      },
      {
        id: 3,
        title: "Creative writing prompts that spark inspiration",
        content: "Here are some of my favorite prompts that always get my creative juices flowing: 1. Write about a moment when you felt completely free...",
        author: "CreativeSpirit",
        category: "writing",
        likes: 156,
        comments: 31,
        timestamp: "1 day ago",
        avatar: "✍️",
        isLiked: false
      },
      {
        id: 4,
        title: "Building a morning routine that works",
        content: "After struggling with consistency, I finally found a morning routine that energizes me for the day. It includes 10 minutes of journaling, meditation, and setting intentions...",
        author: "MorningPerson",
        category: "lifestyle",
        likes: 203,
        comments: 42,
        timestamp: "2 days ago",
        avatar: "🌅",
        isLiked: false
      },
      {
        id: 5,
        title: "Dealing with writer's block in journaling",
        content: "Sometimes I sit down to write and nothing comes out. Here are the techniques that help me break through: free writing, changing my environment, and using prompts...",
        author: "WriterBlock",
        category: "writing",
        likes: 67,
        comments: 18,
        timestamp: "3 days ago",
        avatar: "📝",
        isLiked: false
      }
    ];
    
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (newPost.title.trim() && newPost.content.trim()) {
      const post = {
        id: Date.now(),
        ...newPost,
        author: "You",
        likes: 0,
        comments: 0,
        timestamp: "Just now",
        avatar: "👤",
        isLiked: false
      };
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '', category: 'general' });
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.timestamp) - new Date(a.timestamp);
      case 'popular':
        return b.likes - a.likes;
      case 'comments':
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  const filteredPosts = filter === 'all' 
    ? sortedPosts 
    : sortedPosts.filter(post => post.category === filter);

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📰' },
    { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏' },
    { id: 'writing', name: 'Writing Tips', icon: '✍️' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' }
  ];

  if (loading) {
    return (
      <div className="community-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <div className="header-content">
          <h1 className="community-title font-handwriting">
            <span className="title-icon">🏘️</span>
            Community Hub
          </h1>
          <p className="community-subtitle">
            Connect, share, and grow with fellow journalers
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-number">1,247</span>
              <span className="stat-label">Members</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <span className="stat-number">5,892</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💬</span>
            <div className="stat-info">
              <span className="stat-number">12,456</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="community-content">
        <div className="community-sidebar">
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
                className={`sort-option ${sortBy === 'latest' ? 'active' : ''}`}
                onClick={() => setSortBy('latest')}
              >
                <span className="sort-icon">🕒</span>
                Latest
              </button>
              <button
                className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                <span className="sort-icon">🔥</span>
                Popular
              </button>
              <button
                className={`sort-option ${sortBy === 'comments' ? 'active' : ''}`}
                onClick={() => setSortBy('comments')}
              >
                <span className="sort-icon">💬</span>
                Most Comments
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">Community Guidelines</h3>
            <div className="guidelines">
              <div className="guideline-item">
                <span className="guideline-icon">🤝</span>
                <span className="guideline-text">Be kind and supportive</span>
              </div>
              <div className="guideline-item">
                <span className="guideline-icon">🔒</span>
                <span className="guideline-text">Respect privacy</span>
              </div>
              <div className="guideline-item">
                <span className="guideline-icon">✨</span>
                <span className="guideline-text">Share positive experiences</span>
              </div>
            </div>
          </div>
        </div>

        <div className="community-main">
          <div className="create-post-section">
            <div className="create-post-card">
              <h3 className="create-post-title">Share Your Story</h3>
              <form onSubmit={handleSubmitPost} className="create-post-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="post-title-input"
                    maxLength={100}
                  />
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="category-select"
                  >
                    <option value="general">General</option>
                    <option value="mental-health">Mental Health</option>
                    <option value="gratitude">Gratitude</option>
                    <option value="writing">Writing Tips</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <textarea
                  placeholder="Share your thoughts, experiences, or tips with the community..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="post-content-input"
                  rows={4}
                  maxLength={500}
                />
                <div className="form-actions">
                  <span className="char-count">
                    {newPost.content.length}/500 characters
                  </span>
                  <button type="submit" className="submit-post-btn">
                    <span className="btn-icon">📤</span>
                    Share Post
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="posts-section">
            <div className="posts-header">
              <h3 className="posts-title">
                {filter === 'all' ? 'All Posts' : categories.find(c => c.id === filter)?.name}
              </h3>
              <span className="posts-count">{filteredPosts.length} posts</span>
            </div>

            <div className="posts-list">
              {filteredPosts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">{post.avatar}</div>
                      <div className="author-info">
                        <span className="author-name">{post.author}</span>
                        <span className="post-timestamp">{post.timestamp}</span>
                      </div>
                    </div>
                    <div className="post-category">
                      <span className="category-badge">
                        {categories.find(c => c.id === post.category)?.icon}
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                    </div>
                  </div>

                  <div className="post-content">
                    <h4 className="post-title">{post.title}</h4>
                    <p className="post-text">{post.content}</p>
                  </div>

                  <div className="post-actions">
                    <button
                      className={`action-btn like-btn ${post.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <span className="action-icon">
                        {post.isLiked ? '❤️' : '🤍'}
                      </span>
                      <span className="action-count">{post.likes}</span>
                    </button>
                    <button className="action-btn comment-btn">
                      <span className="action-icon">💬</span>
                      <span className="action-count">{post.comments}</span>
                    </button>
                    <button className="action-btn share-btn">
                      <span className="action-icon">📤</span>
                      <span className="action-text">Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">No posts found</h3>
                <p className="empty-text">
                  Try changing your filter or be the first to share something!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;