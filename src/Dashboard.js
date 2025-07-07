import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import '../Dashboard.css';
import ActivityHeatmap from '../ActivityHeatmap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = ({ user }) => {
  const { username } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);
  const [moodTrends7, setMoodTrends7] = useState([]);
  const [moodTrends180, setMoodTrends180] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [calendarStreaks, setCalendarStreaks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_BASE_URL = 'http://localhost:5001/api';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch recent entries
      const entriesResponse = await fetch(`${API_BASE_URL}/journal?limit=5&sortBy=date&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok && entriesResponse.ok) {
        const statsData = await statsResponse.json();
        const entriesData = await entriesResponse.json();
        
        setDashboardData(statsData.data);
        setRecentEntries(entriesData.data.entries);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch mood trends and activity heatmap data
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch 7-day mood trends
    fetch(`${API_BASE_URL}/insights/mood?period=7`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMoodTrends7(data.data?.intensityTrends || []));
    // Fetch 6-month mood trends
    fetch(`${API_BASE_URL}/insights/mood?period=180`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMoodTrends180(data.data?.intensityTrends || []));
    // Fetch activity heatmap (past year)
    fetch(`${API_BASE_URL}/insights/patterns?period=365`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setActivityData(data.data?.entries || []));
    // Fetch calendar streaks (reuse activity data for now)
    // You can enhance this to highlight streaks specifically
    fetch(`${API_BASE_URL}/insights/patterns?period=365`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCalendarStreaks(data.data?.entries || []));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-green-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-green-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="error-message">
            <h2 className="text-xl font-semibold mb-2">❌ Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn-primary mt-4">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLevelInfo = (level) => {
    const levels = {
      1: { name: 'Novice Journaler', color: '#6b7280', icon: '🌱' },
      2: { name: 'Mindful Writer', color: '#10b981', icon: '📝' },
      3: { name: 'Emotional Explorer', color: '#3b82f6', icon: '🔍' },
      4: { name: 'Wellness Warrior', color: '#8b5cf6', icon: '⚔️' },
      5: { name: 'Sage of Self', color: '#f59e0b', icon: '🧘' },
      6: { name: 'Master of Mindfulness', color: '#ec4899', icon: '🌟' }
    };
    return levels[level] || levels[1];
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      calm: '😌',
      anxious: '😰',
      joyful: '😄',
      tired: '😴',
      neutral: '😐'
    };
    return emojis[mood] || '😐';
  };

  const levelInfo = getLevelInfo(dashboardData?.level || 1);

  // Example mood and happiness data (replace with backend data)
  const moodData = dashboardData?.moodTrends || [
    { date: 'Mon', mood: 3 },
    { date: 'Tue', mood: 4 },
    { date: 'Wed', mood: 2 },
    { date: 'Thu', mood: 5 },
    { date: 'Fri', mood: 4 },
    { date: 'Sat', mood: 3 },
    { date: 'Sun', mood: 5 },
  ];
  const happinessData = dashboardData?.happinessTrends || [
    { date: 'Mon', happiness: 60 },
    { date: 'Tue', happiness: 70 },
    { date: 'Wed', happiness: 50 },
    { date: 'Thu', happiness: 80 },
    { date: 'Fri', happiness: 75 },
    { date: 'Sat', happiness: 65 },
    { date: 'Sun', happiness: 90 },
  ];

  // Filter activityData for selected month/year
  const filteredActivityData = activityData.filter(entry => {
    const date = new Date(entry.createdAt);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  return (
    <div className="dashboard-container" style={{ marginLeft: 300, maxWidth: 'calc(100vw - 300px)' }}>
      {/* Title & Level */}
      <div className="dashboard-title-banner">
        <span style={{ fontSize: 28 }}>{levelInfo.icon}</span> Welcome back, <b>{user?.username}</b>!
        <span style={{ float: 'right', fontWeight: 400, fontSize: 18 }}>
          Level {dashboardData?.level} - <span style={{ color: levelInfo.color }}>{levelInfo.name}</span>
        </span>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid">
        <div className="card stats-card">
          <div className="stats-label">Total Entries</div>
          <div className="stats-value">{dashboardData?.totalEntries || 0}</div>
        </div>
        <div className="card stats-card">
          <div className="stats-label">Total Points</div>
          <div className="stats-value">{dashboardData?.totalPoints || 0}</div>
        </div>
        <div className="card stats-card">
          <div className="stats-label">Current Streak</div>
          <div className="stats-value">🔥 {dashboardData?.currentStreak || 0} days</div>
        </div>
        <div className="card stats-card">
          <div className="stats-label">Average Points</div>
          <div className="stats-value">{dashboardData?.averagePoints || 0}</div>
        </div>
        <div className="card stats-card">
          <div className="stats-label">Most Common Mood</div>
          <div className="stats-value">{getMoodEmoji(dashboardData?.mostCommonMood)} {dashboardData?.mostCommonMood || 'N/A'}</div>
        </div>
        <div className="card stats-card">
          <div className="stats-label">Best Day Score</div>
          <div className="stats-value">{dashboardData?.bestDayScore || 0}</div>
        </div>
      </div>

      {/* Motivational Quote / Tip */}
      {dashboardData?.motivationalQuote && (
        <div className="card dashboard-full-width" style={{ margin: '1rem 0', textAlign: 'center', fontStyle: 'italic', background: '#fff0f6' }}>
          <span style={{ fontSize: 22 }}>💡</span> "{dashboardData.motivationalQuote.text}" <br/>
          <span style={{ fontSize: 14, color: '#c7376c' }}>— {dashboardData.motivationalQuote.author}</span>
        </div>
      )}

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Mood Trends (7 days) */}
        <div className="card">
          <div className="card-title">Mood Trends (Last 7 Days)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodTrends7} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Mood Trends (6 months) */}
        <div className="card">
          <div className="card-title">Mood Trends (6 Months)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodTrends180} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Happiness Trends (Bar) */}
        <div className="card">
          <div className="card-title">Happiness Trends</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={happinessData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="happiness" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Most Common Moods (Bar) */}
        <div className="card">
          <div className="card-title">Most Common Moods</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Object.entries(dashboardData?.moodStats || {}).map(([mood, count]) => ({ mood, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mood" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f472b6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Heatmap & Calendar Row */}
      <div className="dashboard-grid">
        <div className="card dashboard-full-width">
          <div className="card-title">Activity Heatmap</div>
          <ActivityHeatmap data={activityData.reduce((acc, entry) => {
            const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
          }, {})} />
        </div>
        <div className="card dashboard-full-width">
          <div className="card-title">Calendar & Streaks</div>
          <Calendar
            value={new Date()}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dateStr = date.toISOString().split('T')[0];
                const hasEntry = activityData.some(entry => new Date(entry.createdAt).toISOString().split('T')[0] === dateStr);
                return hasEntry ? <div className="calendar-activity-dot" style={{ background: '#ec4899' }}></div> : null;
              }
            }}
          />
        </div>
      </div>

      {/* Recent Entries & Fun Elements */}
      <div className="dashboard-grid">
        <div className="card dashboard-full-width">
          <div className="card-title">Recent Entries</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {recentEntries && recentEntries.length > 0 ? recentEntries.map((entry, idx) => (
              <li key={entry._id || idx} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{entry.title || 'Untitled'}</span> — <span style={{ color: '#8b5cf6' }}>{new Date(entry.date).toLocaleDateString()}</span>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{entry.content?.slice(0, 80)}{entry.content?.length > 80 ? '...' : ''}</div>
              </li>
            )) : <li>No recent entries found.</li>}
          </ul>
        </div>
        <div className="card dashboard-full-width" style={{ background: '#f0fdf4', textAlign: 'center' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🌟 Tip of the Day</div>
          <div style={{ fontSize: 16 }}>
            {dashboardData?.motivationalQuote?.text || 'Keep journaling every day for new insights and rewards!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 