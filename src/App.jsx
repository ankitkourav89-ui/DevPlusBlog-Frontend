import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  Feather,
  Sparkles,
  Server,
  User as UserIcon
} from 'lucide-react';
import { authService, blogService, systemService } from './services/api';
import './index.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(authService.getCurrentUser());
  
  // Health status states
  const [healthStatus, setHealthStatus] = useState('checking');
  const [readinessStatus, setReadinessStatus] = useState('checking');

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [postLoading, setPostLoading] = useState(false);

  // Expanded comments state: { [postId]: { comments: [], loading: bool, newComment: '' } }
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    
    // Check system status
    const health = await systemService.checkHealth();
    const readiness = await systemService.checkReadiness();
    setHealthStatus(health.status === 'healthy' ? 'healthy' : 'down');
    setReadinessStatus(readiness.status === 'ready' ? 'ready' : 'unready');

    // Fetch posts
    try {
      const data = await blogService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Unable to load blog posts. Make sure Django backend is running at http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      await authService.login(loginForm.username, loginForm.password);
      setUser({ username: loginForm.username });
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Invalid username or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) return;
    setPostLoading(true);

    try {
      const newPost = await blogService.createPost(postForm);
      setPosts([newPost, ...posts]);
      setPostForm({ title: '', content: '' });
      setShowCreatePostModal(false);
    } catch (err) {
      console.error('Create post error:', err);
      alert('Failed to publish post. Please check authentication.');
    } finally {
      setPostLoading(false);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedComments[postId]?.open) {
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], open: false },
      }));
      return;
    }

    setExpandedComments((prev) => ({
      ...prev,
      [postId]: { comments: [], loading: true, open: true, newComment: '' },
    }));

    try {
      const comments = await blogService.getComments(postId);
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], comments, loading: false },
      }));
    } catch (err) {
      console.error('Failed to load comments:', err);
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], loading: false },
      }));
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = expandedComments[postId]?.newComment;
    if (!commentText || !commentText.trim()) return;

    try {
      const createdComment = await blogService.createComment(postId, commentText);
      setExpandedComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [...(prev[postId].comments || []), createdComment],
          newComment: '',
        },
      }));
      // Update comment count on post
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please log in first.');
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Feather size={20} />
          </div>
          <span>DevPulse Blog</span>
        </div>

        <div className="nav-actions">
          {/* Health status badge */}
          <div className="status-pill" title="Backend Service Health">
            <Server size={14} className="text-muted" />
            <span className={`status-dot ${healthStatus === 'healthy' ? 'active' : 'inactive'}`}></span>
            <span>{healthStatus === 'healthy' ? 'System Healthy' : 'Offline'}</span>
          </div>

          {user ? (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreatePostModal(true)}
              >
                <PlusCircle size={16} />
                Create Post
              </button>

              <div className="status-pill">
                <UserIcon size={14} />
                <span>{user.username}</span>
              </div>

              <button className="btn btn-secondary" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => setShowLoginModal(true)}
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
          <Sparkles size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CI/CD Powered Microblogging
          </span>
        </div>
        <h1 className="hero-title">Ideas, Stories & System Insights</h1>
        <p className="hero-subtitle">
          Real-time blog platform powered by React 19, Vite, and Django REST API backends with automated CI/CD pipeline integration.
        </p>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Published Posts</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: healthStatus === 'healthy' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {healthStatus === 'healthy' ? '100%' : 'Degraded'}
            </span>
            <span className="stat-label">API Health</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{readinessStatus === 'ready' ? 'Ready' : 'Pending'}</span>
            <span className="stat-label">Readiness</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="main-grid">
        {error && (
          <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
            <p>Loading posts from Django API backend...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <Feather size={40} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3>No posts published yet</h3>
            <p>Be the first author to publish a blog post on DevPulse!</p>
            {!user && (
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1.25rem' }}
                onClick={() => setShowLoginModal(true)}
              >
                Sign In to Post
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => {
            const authorName = post.author?.user?.username || 'Anonymous';
            const commentsData = expandedComments[post.id] || {};

            return (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <div className="author-meta">
                    <div className="avatar">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="author-name">@{authorName}</div>
                      <div className="post-date">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="post-title">{post.title}</h2>
                <p className="post-content">{post.content}</p>

                <div className="post-footer">
                  <button 
                    className="action-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare size={16} />
                    <span>{post.comments_count || 0} Comments</span>
                  </button>
                </div>

                {/* Expanded Comments Section */}
                {commentsData.open && (
                  <div className="comments-section">
                    {commentsData.loading ? (
                      <div style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Loading comments...
                      </div>
                    ) : commentsData.comments && commentsData.comments.length > 0 ? (
                      commentsData.comments.map((comment) => (
                        <div key={comment.id} className="comment-card">
                          <span className="comment-time">
                            {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          <div className="comment-author">@{comment.author?.user?.username || 'User'}</div>
                          <div className="comment-text">{comment.content}</div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: '0.5rem 0' }}>
                        No comments yet on this post.
                      </p>
                    )}

                    {/* Add Comment Input */}
                    {user ? (
                      <div className="comment-input-group">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Write a comment..."
                          value={commentsData.newComment || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: { ...prev[post.id], newComment: val },
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                        />
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAddComment(post.id)}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        Please <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setShowLoginModal(true)}>sign in</span> to post a comment.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Sign In to DevPulse</h3>
              <button className="close-btn" onClick={() => setShowLoginModal(false)}>
                <X size={20} />
              </button>
            </div>

            {authError && <div className="alert-box alert-error">{authError}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="e.g. admin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required 
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                disabled={authLoading}
              >
                {authLoading ? <div className="loading-spinner" /> : 'Authenticate'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="modal-backdrop" onClick={() => setShowCreatePostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Article</h3>
              <button className="close-btn" onClick={() => setShowCreatePostModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  placeholder="Enter a descriptive title..."
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Article Body</label>
                <textarea 
                  className="input-field" 
                  required 
                  placeholder="Write your article content here..."
                  rows={5}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                disabled={postLoading}
              >
                {postLoading ? <div className="loading-spinner" /> : 'Publish Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
