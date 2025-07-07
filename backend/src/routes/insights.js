const express = require('express');
const { protect } = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const chatbotService = require('../services/chatbotService');

const router = express.Router();

// @desc    Get comprehensive insights
// @route   GET /api/insights/comprehensive
// @access  Private
router.get('/comprehensive', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user._id;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get entries in date range
    const entries = await JournalEntry.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEntries: 0,
          totalPoints: 0,
          currentStreak: 0,
          averagePoints: 0,
          moodStats: {},
          aiInsights: {
            emotionalPatterns: "No entries found in the selected time period.",
            growthAreas: "Start journaling to see your insights!",
            recommendations: ["Write your first entry today", "Set a daily journaling goal"]
          }
        }
      });
    }

    // Calculate basic stats
    const totalEntries = entries.length;
    const totalPoints = entries.reduce((sum, entry) => sum + (entry.aiAnalysis?.pointsEarned || 0), 0);
    const averagePoints = totalPoints / totalEntries;

    // Calculate mood statistics
    const moodStats = {};
    entries.forEach(entry => {
      const mood = entry.mood?.primary || 'neutral';
      moodStats[mood] = (moodStats[mood] || 0) + 1;
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate writing patterns
    const dayOfWeekStats = {};
    const wordCounts = [];
    let totalWords = 0;
    
    entries.forEach(entry => {
      const dayOfWeek = new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
      
      const wordCount = entry.content.split(' ').length;
      wordCounts.push(wordCount);
      totalWords += wordCount;
    });

    const mostActiveDay = Object.entries(dayOfWeekStats)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    const averageWordsPerEntry = totalWords / totalEntries;
    const completionRate = (currentStreak / parseInt(days)) * 100;
    const bestDayScore = Math.max(...entries.map(entry => entry.aiAnalysis?.pointsEarned || 0));

    // Generate points trend (last 7 entries)
    const pointsTrend = entries.slice(0, 7).map(entry => entry.aiAnalysis?.pointsEarned || 0).reverse();

    // Generate achievements
    const achievements = generateAchievements(totalEntries, currentStreak, totalPoints, averagePoints);

    // Generate weekly summary
    const weeklySummary = await generateWeeklySummary(entries);

    // Generate AI insights
    const aiInsights = await generateAIInsights(entries, moodStats, totalPoints, averagePoints);

    res.json({
      success: true,
      data: {
        totalEntries,
        totalPoints,
        currentStreak,
        averagePoints,
        moodStats,
        mostActiveDay,
        averageWordsPerEntry: Math.round(averageWordsPerEntry),
        completionRate: Math.round(completionRate),
        bestDayScore,
        pointsTrend,
        achievements,
        weeklySummary,
        aiInsights
      }
    });
  } catch (error) {
    console.error('Comprehensive insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating insights'
    });
  }
});

// Helper function to generate achievements
const generateAchievements = (totalEntries, currentStreak, totalPoints, averagePoints) => {
  const achievements = [];
  
  if (totalEntries >= 1) {
    achievements.push({
      title: "First Steps",
      description: "Wrote your first journal entry"
    });
  }
  
  if (totalEntries >= 7) {
    achievements.push({
      title: "Week Warrior",
      description: "Completed a week of journaling"
    });
  }
  
  if (currentStreak >= 7) {
    achievements.push({
      title: "Streak Master",
      description: "Maintained a 7-day writing streak"
    });
  }
  
  if (currentStreak >= 30) {
    achievements.push({
      title: "Monthly Master",
      description: "Maintained a 30-day writing streak"
    });
  }
  
  if (totalPoints >= 100) {
    achievements.push({
      title: "Century Club",
      description: "Earned 100 total points"
    });
  }
  
  if (averagePoints >= 30) {
    achievements.push({
      title: "High Achiever",
      description: "Maintained high emotional well-being"
    });
  }
  
  return achievements;
};

// Helper function to generate weekly summary
const generateWeeklySummary = async (entries) => {
  try {
    const recentEntries = entries.slice(0, 7);
    if (recentEntries.length === 0) return null;
    
    const summary = await chatbotService.generateWeeklySummary(recentEntries);
    return summary;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return null;
  }
};

// Helper function to generate AI insights
const generateAIInsights = async (entries, moodStats, totalPoints, averagePoints) => {
  try {
    const recentEntries = entries.slice(0, 10);
    const insights = await chatbotService.generateInsights({
      entries: recentEntries,
      moodStats,
      totalPoints,
      averagePoints
    });
    
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      emotionalPatterns: "Analysis not available at the moment.",
      growthAreas: "Continue journaling to unlock deeper insights.",
      recommendations: ["Keep writing regularly", "Reflect on your emotions"]
    };
  }
};

// @desc    Get comprehensive insights
// @route   GET /api/insights
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const user = await User.findById(req.user._id);
    
    // Get entries for the specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await JournalEntry.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate mood trends
    const moodTrends = await JournalEntry.getMoodStats(req.user._id, days);
    
    // Calculate writing patterns
    const entriesByDay = {};
    const entriesByHour = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt).toDateString();
      const hour = new Date(entry.createdAt).getHours();
      
      entriesByDay[date] = (entriesByDay[date] || 0) + 1;
      entriesByHour[hour] = (entriesByHour[hour] || 0) + 1;
    });

    // Get most active days and hours
    const mostActiveDay = Object.keys(entriesByDay).reduce((a, b) => 
      entriesByDay[a] > entriesByDay[b] ? a : b
    );
    
    const mostActiveHour = Object.keys(entriesByHour).reduce((a, b) => 
      entriesByHour[a] > entriesByHour[b] ? a : b
    );

    // Calculate sentiment trends
    const sentimentScores = entries.map(entry => entry.aiAnalysis?.sentimentScore || 0);
    const averageSentiment = sentimentScores.length > 0 
      ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
      : 0;

    // Get most common themes and keywords
    const allKeywords = entries.flatMap(entry => entry.aiAnalysis?.keywords || []);
    const allThemes = entries.flatMap(entry => entry.aiAnalysis?.themes || []);
    
    const keywordCounts = {};
    const themeCounts = {};
    
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    allThemes.forEach(theme => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    const topThemes = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // Get AI-generated insights
    const userContext = {
      username: user.username,
      streak: user.streak,
      totalEntries: user.totalEntries,
      level: user.level,
      points: user.points,
      moodStats: user.moodStats
    };

    const aiInsights = await chatbotService.generateInsights(userContext, entries);

    res.json({
      success: true,
      data: {
        period: days,
        overview: {
          totalEntries: entries.length,
          totalWords: entries.reduce((sum, entry) => sum + entry.wordCount, 0),
          averageWordsPerEntry: entries.length > 0 
            ? Math.round(entries.reduce((sum, entry) => sum + entry.wordCount, 0) / entries.length)
            : 0,
          averageSentiment: Math.round(averageSentiment * 100) / 100,
          writingStreak: user.streak
        },
        moodTrends,
        patterns: {
          mostActiveDay,
          mostActiveHour: parseInt(mostActiveHour),
          entriesByDay,
          entriesByHour
        },
        content: {
          topKeywords,
          topThemes,
          averageSentiment
        },
        aiInsights
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insights'
    });
  }
});

// @desc    Get mood analysis
// @route   GET /api/insights/mood
// @access  Private
router.get('/mood', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const moodStats = await JournalEntry.getMoodStats(req.user._id, days);
    
    // Get mood trends over time
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await JournalEntry.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    })
    .select('mood createdAt')
    .sort({ createdAt: 1 })
    .lean();

    // Group by week for trend analysis
    const weeklyMoods = {};
    entries.forEach(entry => {
      const weekStart = new Date(entry.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMoods[weekKey]) {
        weeklyMoods[weekKey] = { happy: 0, sad: 0, excited: 0, calm: 0, anxious: 0, joyful: 0, tired: 0, neutral: 0 };
      }
      weeklyMoods[weekKey][entry.mood.primary]++;
    });

    // Calculate mood intensity trends
    const intensityTrends = entries.map(entry => ({
      date: entry.createdAt,
      mood: entry.mood.primary,
      intensity: entry.mood.intensity
    }));

    res.json({
      success: true,
      data: {
        period: days,
        moodStats,
        weeklyTrends: weeklyMoods,
        intensityTrends,
        totalMoodEntries: entries.length
      }
    });
  } catch (error) {
    console.error('Get mood insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood insights'
    });
  }
});

// @desc    Get writing patterns
// @route   GET /api/insights/patterns
// @access  Private
router.get('/patterns', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await JournalEntry.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    })
    .select('createdAt wordCount readingTime tags')
    .sort({ createdAt: 1 })
    .lean();

    // Analyze writing patterns
    const patterns = {
      byDayOfWeek: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      byHour: {},
      byWordCount: { short: 0, medium: 0, long: 0 },
      byReadingTime: { quick: 0, moderate: 0, detailed: 0 },
      tagUsage: {}
    };

    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      // Day of week
      patterns.byDayOfWeek[dayOfWeek]++;

      // Hour of day
      patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;

      // Word count categories
      if (entry.wordCount < 100) patterns.byWordCount.short++;
      else if (entry.wordCount < 500) patterns.byWordCount.medium++;
      else patterns.byWordCount.long++;

      // Reading time categories
      if (entry.readingTime < 2) patterns.byReadingTime.quick++;
      else if (entry.readingTime < 5) patterns.byReadingTime.moderate++;
      else patterns.byReadingTime.detailed++;

      // Tag usage
      entry.tags.forEach(tag => {
        patterns.tagUsage[tag] = (patterns.tagUsage[tag] || 0) + 1;
      });
    });

    // Find most active times
    const mostActiveDay = Object.keys(patterns.byDayOfWeek).reduce((a, b) => 
      patterns.byDayOfWeek[a] > patterns.byDayOfWeek[b] ? a : b
    );
    
    const mostActiveHour = Object.keys(patterns.byHour).reduce((a, b) => 
      patterns.byHour[a] > patterns.byHour[b] ? a : b
    );

    // Top tags
    const topTags = Object.entries(patterns.tagUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    res.json({
      success: true,
      data: {
        period: days,
        patterns: {
          byDayOfWeek: patterns.byDayOfWeek,
          byHour: patterns.byHour,
          byWordCount: patterns.byWordCount,
          byReadingTime: patterns.byReadingTime,
          tagUsage: patterns.tagUsage
        },
        insights: {
          mostActiveDay: dayNames[parseInt(mostActiveDay)],
          mostActiveHour: parseInt(mostActiveHour),
          topTags,
          totalEntries: entries.length
        }
      }
    });
  } catch (error) {
    console.error('Get patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching writing patterns'
    });
  }
});

// @desc    Get progress insights
// @route   GET /api/insights/progress
// @access  Private
router.get('/progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate progress metrics
    const totalDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    const averageEntriesPerDay = totalDays > 0 ? (user.totalEntries / totalDays).toFixed(2) : 0;
    const completionRate = totalDays > 0 ? ((user.totalEntries / totalDays) * 100).toFixed(1) : 0;

    // Get monthly progress
    const monthlyProgress = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      
      const monthStats = await JournalEntry.getMonthlyStats(
        req.user._id,
        monthDate.getFullYear(),
        monthDate.getMonth() + 1
      );

      monthlyProgress.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        entries: monthStats[0]?.totalEntries || 0,
        words: monthStats[0]?.totalWords || 0,
        points: monthStats[0]?.totalPoints || 0,
        avgSentiment: monthStats[0]?.avgSentiment || 0
      });
    }

    // Calculate growth rate
    const recentEntries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentAvgWords = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + entry.wordCount, 0) / recentEntries.length
      : 0;

    const olderEntries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(10)
      .limit(10)
      .lean();

    const olderAvgWords = olderEntries.length > 0
      ? olderEntries.reduce((sum, entry) => sum + entry.wordCount, 0) / olderEntries.length
      : 0;

    const wordGrowthRate = olderAvgWords > 0 
      ? ((recentAvgWords - olderAvgWords) / olderAvgWords * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalDays,
          averageEntriesPerDay: parseFloat(averageEntriesPerDay),
          completionRate: parseFloat(completionRate),
          currentStreak: user.streak,
          totalEntries: user.totalEntries,
          totalPoints: user.points,
          currentLevel: user.level,
          progressToNextLevel: user.progressToNextLevel
        },
        monthlyProgress,
        growth: {
          wordGrowthRate: parseFloat(wordGrowthRate),
          recentAvgWords: Math.round(recentAvgWords),
          olderAvgWords: Math.round(olderAvgWords)
        }
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress insights'
    });
  }
});

module.exports = router; 