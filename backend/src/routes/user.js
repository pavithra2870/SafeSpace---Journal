const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

const router = express.Router();

// @desc    Get all data for the user dashboard (Optimized)
// @route   GET /api/user/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // 1. Get the user's base stats (using lean() for speed and virtuals:true for level/progress)
    const user = await User.findById(req.user._id).lean({ virtuals: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Perform ONE efficient database call to get all entries from the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const allEntriesLastYear = await JournalEntry.find({
      author: req.user._id, // Corrected from 'user' to 'author' if that's your schema
      createdAt: { $gte: oneYearAgo }
    }).sort({ createdAt: -1 }); // Sort descending to easily get recent entries

    // 3. Process the results in memory (much faster than multiple DB calls)
    const heatmapData = {};
    const moodTrends = {}; // For future chart use
    
    allEntriesLastYear.forEach(entry => {
      const dateStr = entry.createdAt.toISOString().split('T')[0];
      // Aggregate data for the heatmap
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      // You can add more complex aggregations here for charts
    });

    // 4. Find the most common mood from the user's lifetime stats
    const mostCommonMood = user.moodStats 
      ? Object.keys(user.moodStats).reduce((a, b) => user.moodStats[a] > user.moodStats[b] ? a : b, 'neutral')
      : 'neutral';
    
    // 5. Generate a motivational quote
    const motivationalQuote = generateMotivationalQuote(user, user.points, user.streak);

    // 6. Assemble the final, clean data structure for the frontend
    res.json({
      success: true,
      data: {
        // Core user stats
        stats: {
          totalEntries: user.totalEntries,
          totalPoints: user.points,
          currentStreak: user.streak,
          longestStreak: user.longestStreak || user.streak, // Add longestStreak to your user model!
          level: user.level, // From virtual
          progressToNextLevel: user.progressToNextLevel, // From virtual
          primaryMood: mostCommonMood,
          motivationalQuote: motivationalQuote,
        },
        // Data for charts and visualizations
        emotionDistribution: user.moodStats ? Object.entries(user.moodStats).map(([label, value]) => ({ label, value })) : [],
        moodTrends: moodTrends, // For future enhancement
        heatmapData: heatmapData,
        // List of recent entries
        recentEntries: allEntriesLastYear.slice(0, 5), // Get the first 5 from our sorted list
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// Helper function to generate motivational quote (Unchanged)
const generateMotivationalQuote = (user, totalPoints, currentStreak) => {
  // ... your existing motivational quote logic is great and remains here ...
  const quotes = [
    { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Anonymous" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your journey is unique. Embrace it.", author: "Anonymous" },
    // ... more quotes
  ];
  let selectedQuote;
  if (currentStreak >= 30) {
    selectedQuote = quotes[2]; // Example for long streak
  } else if (totalPoints >= 500) {
    selectedQuote = quotes[1]; // Example for high points
  } else {
    selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
  }
  return selectedQuote;
};


// --- Your other routes like /profile, /stats, etc. remain below ---
// (No changes needed for them)

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  // ... your existing code ...
});

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  // ... your existing code ...
});

// ... and so on for all your other routes in this file.

module.exports = router;
