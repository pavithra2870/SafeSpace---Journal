const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const chatbotService = require('../services/chatbotService');

const router = express.Router();

// Validation middleware for journal entry creation and update
const entryValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('mood.primary')
    .isIn(['happy', 'sad', 'excited', 'calm', 'anxious', 'joyful', 'tired', 'neutral'])
    .withMessage('Invalid primary mood'),
  body('mood.intensity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood intensity must be between 1 and 10'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean')
];

// Create a new journal entry
router.post('/', protect, entryValidation, async (req, res) => {
  try {
    const { title, content, mood, tags, weather, location, isPrivate } = req.body;

    const entry = new JournalEntry({
      user: req.user._id,
      title,
      content,
      mood,
      tags: tags || [],
      weather: weather || 'unknown',
      location: location || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    // Analyze entry with AI
    const analysis = await chatbotService.analyzeEntry(content, {
      moodStats: req.user.moodStats,
      streak: req.user.streak,
      totalEntries: req.user.totalEntries
    });

    entry.aiAnalysis = {
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      keywords: analysis.keywords || [],
      themes: analysis.themes || [],
      suggestions: analysis.suggestions || [],
      pointsEarned: analysis.pointsEarned || 10
    };

    // Update mood if AI detected different mood
    if (analysis.primaryMood && analysis.primaryMood !== mood.primary) {
      entry.mood.primary = analysis.primaryMood;
    }

    if (analysis.moodIntensity) {
      entry.mood.intensity = analysis.moodIntensity;
    }

    await entry.save();

    // Update user stats including streak
    const user = await User.findById(req.user._id);
    if (user) {
      user.totalEntries += 1;
      user.points += entry.aiAnalysis.pointsEarned;

      if (user.moodStats && user.moodStats[entry.mood.primary] !== undefined) {
        user.moodStats[entry.mood.primary] += 1;
      }

      await user.updateStreak(); // Update streak and save user
    } else {
      console.warn(`User ${req.user._id} not found, could not update stats.`);
    }

    res.status(201).json({
      success: true,
      message: '🌸 Your journal entry has been saved and stats updated!',
      data: {
        entry: {
          _id: entry._id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          aiAnalysis: entry.aiAnalysis,
          wordCount: entry.wordCount,
          readingTime: entry.readingTime,
          createdAt: entry.createdAt
        },
        pointsEarned: entry.aiAnalysis.pointsEarned,
        totalPoints: user ? user.points : 0,
        currentStreak: user ? user.streak : 0,
        encouragement: analysis.encouragement
      }
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating journal entry'
    });
  }
});

// Get all journal entries for user with search and sorting
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      mood, 
      isPrivate, 
      isFavorite, 
      search,
      sortBy = 'date', // 'date', 'alphabet', 'points'
      sortOrder = 'desc' // 'asc', 'desc'
    } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    if (mood) query['mood.primary'] = mood;
    if (isPrivate !== undefined) query.isPrivate = isPrivate === 'true';
    if (isFavorite !== undefined) query.isFavorite = isFavorite === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortObject = {};
    switch (sortBy) {
      case 'alphabet':
        sortObject.title = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'points':
        sortObject['aiAnalysis.pointsEarned'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'date':
      default:
        sortObject.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
    }

    const entries = await JournalEntry.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: skip + entries.length < total,
          hasPrev: page > 1
        },
        search: search || null,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entries'
    });
  }
});

// Get single journal entry
router.get('/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entry'
    });
  }
});

// Update journal entry (same day only)
router.put('/:id', protect, entryValidation, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (!entry.canEdit()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit entries from today'
      });
    }

    const { title, content, mood, tags, weather, location, isPrivate } = req.body;

    if (title) entry.title = title;
    if (content) entry.content = content;
    if (mood) entry.mood = mood;
    if (tags) entry.tags = tags;
    if (weather) entry.weather = weather;
    if (location) entry.location = location;
    if (isPrivate !== undefined) entry.isPrivate = isPrivate;

    if (content && content !== entry.content) {
      const analysis = await chatbotService.analyzeEntry(content, {
        moodStats: req.user.moodStats,
        streak: req.user.streak,
        totalEntries: req.user.totalEntries
      });

      // Adjust user points accordingly
      const user = await User.findById(req.user._id);
      const oldPoints = entry.aiAnalysis?.pointsEarned || 0;
      const newPoints = analysis.pointsEarned || 10;
      user.points = user.points - oldPoints + newPoints;
      await user.save();

      entry.aiAnalysis = {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        keywords: analysis.keywords || [],
        themes: analysis.themes || [],
        suggestions: analysis.suggestions || [],
        pointsEarned: newPoints,
        therapeuticNotes: analysis.therapeuticNotes || ''
      };

      // Update mood if AI detected different mood
      if (analysis.primaryMood && analysis.primaryMood !== mood.primary) {
        entry.mood.primary = analysis.primaryMood;
      }
      if (analysis.moodIntensity) {
        entry.mood.intensity = analysis.moodIntensity;
      }
    }

    await entry.save();

    res.json({
      success: true,
      message: '🌸 Journal entry updated successfully!',
      data: { entry }
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating journal entry'
    });
  }
});

// Delete journal entry (same day only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (!entry.canDelete()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete entries from today'
      });
    }

    const user = await User.findById(req.user._id);
    user.totalEntries = Math.max(0, user.totalEntries - 1);
    user.points = Math.max(0, user.points - (entry.aiAnalysis?.pointsEarned || 0));
    await user.save();

    await JournalEntry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '🌸 Journal entry deleted successfully!'
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting journal entry'
    });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({
      success: true,
      message: entry.isFavorite 
        ? '🌸 Added to favorites!' 
        : '🌸 Removed from favorites!',
      data: { isFavorite: entry.isFavorite }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorite status'
    });
  }
});

// Get journal statistics overview
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const moodStats = await JournalEntry.getMoodStats(req.user._id, parseInt(days));
    const writingStreak = await JournalEntry.getWritingStreak(req.user._id);
    
    const totalEntries = await JournalEntry.countDocuments({ user: req.user._id });
    const totalWords = await JournalEntry.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$wordCount' } } }
    ]);

    const favoriteEntries = await JournalEntry.countDocuments({ 
      user: req.user._id, 
      isFavorite: true 
    });

    res.json({
      success: true,
      data: {
        moodStats,
        writingStreak,
        totalEntries,
        totalWords: totalWords[0]?.total || 0,
        favoriteEntries,
        averageWordsPerEntry: totalEntries > 0 ? Math.round((totalWords[0]?.total || 0) / totalEntries) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal statistics'
    });
  }
});

module.exports = router;
