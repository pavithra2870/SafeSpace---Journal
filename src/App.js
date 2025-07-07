import { useState, useEffect } from 'react';
import './App.css';
import './output.css';
import './custom.css';
import NavBar from './NavBar';
import Home from './Home';
import Footer from './Footer';
import JournalEntry from './components/JournalEntry';
import Layout2 from './Layout2';
import Signin from './SignIn';
import Login from './Login';
import Layout1 from './Layout1';
import Layout3 from './Layout3';
import Layout4 from './Layout4';
import Layout from './Layout4';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Features from './Features';
import Manifestations from './Manifestations';
import Contact from './Contact';
import Affirmations from './Affirmations';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile from:', `${API_BASE_URL}/auth/me`);
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        console.log('Token invalid, removing from localStorage');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.error('Login failed:', errorData);
        return { success: false, message: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      console.log('Login successful:', data);

      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check if the backend is running on port 5001.' };
    }
  };

  const handleSignup = async (email, username, password) => {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.error('Signup failed:', errorData);
        return { success: false, message: errorData.message || 'Signup failed' };
      }

      const data = await response.json();
      console.log('Signup successful:', data);

      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please check if the backend is running on port 5001.' };
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      // Ignore errors, proceed to clear client state
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-pink-600 text-lg">Loading your safe space... 🌸</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Public Route component (redirects to user dashboard if logged in)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-pink-600 text-lg">Loading... 🌸</p>
          </div>
        </div>
      );
    }

    if (user) {
      return <Navigate to={`/${user.username}`} replace />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 text-lg">Loading your safe space... 🌸</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="first-pg flex flex-col min-h-screen">
        <NavBar user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth routes */}
            <Route 
              path="/signin" 
              element={
                <PublicRoute>
                  <Signin onSignup={handleSignup} />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login onLogin={handleLogin} />
                </PublicRoute>
              } 
            />

            {/* Protected routes - redirect to user's personal space */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navigate to={user ? `/${user.username}` : '/login'} replace />
                </ProtectedRoute>
              } 
            />

            {/* User-specific routes */}
            <Route 
              path="/:username" 
              element={
                <ProtectedRoute>
                  <Layout user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/journals" 
              element={
                <ProtectedRoute>
                  <Layout1 user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/entry" 
              element={
                <ProtectedRoute>
                  <JournalEntry user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/community" 
              element={
                <ProtectedRoute>
                  <Layout3 user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/affirmations" 
              element={
                <ProtectedRoute>
                  <Affirmations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/manifestations" 
              element={
                <ProtectedRoute>
                  <Manifestations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/:username/insights" 
              element={
                <ProtectedRoute>
                  <Layout4 user={user} />
                </ProtectedRoute>
              } 
            />

            {/* 404 route */}
            <Route
              path="*"
              element={
                <div className="text-center py-20 text-pink-600 text-xl">
                  404 — Page Not Found 🌸
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;