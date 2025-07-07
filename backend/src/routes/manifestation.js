const express = require('express');
const router = express.Router();
const Manifestation = require('../models/Manifestation'); // Make sure this path is correct
const { protect } = require('../middleware/auth');

// [CREATE] Create a manifestation - FIXED
router.post('/', protect, async (req, res) => {
  try {
    // FIX 1: Add a defensive check to ensure the auth middleware is working correctly.
    if (!req.user || !req.user._id) {
      // This error happens if the 'protect' middleware fails to attach the user.
      return res.status(401).json({ success: false, message: 'Authentication error, user not found.' });
    }

    const { title, category, priority } = req.body;
    
    // Your existing validation is good.
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
    }

    const manifestation = await Manifestation.create({
      user: req.user._id,
      title,
      category: category || 'personal',
      priority: priority || 'medium',
    });

    res.status(201).json({ success: true, data: manifestation });

  } catch (err) {
    // FIX 2: Add server-side logging for easier debugging.
    console.error("--- MANIFESTATION CREATE ERROR ---");
    console.error(err);
    console.error("----------------------------------");
    
    // Send back a more informative error message.
    res.status(500).json({ success: false, message: 'Failed to create manifestation due to a server error.', error: err.message });
  }
});

// [READ] Get all manifestations for the logged-in user (Unchanged)
router.get('/', protect, async (req, res) => {
  try {
    const manifestations = await Manifestation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: manifestations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// [UPDATE] Update a manifestation (Unchanged)
router.put('/:id', protect, async (req, res) => {
  try {
    const manifestation = await Manifestation.findOne({ _id: req.params.id, user: req.user._id });
    if (!manifestation) {
      return res.status(404).json({ success: false, message: 'Manifestation not found.' });
    }

    if (typeof req.body.fulfilled === 'boolean') {
      manifestation.fulfilled = req.body.fulfilled;
      manifestation.fulfilledDate = req.body.fulfilled ? new Date() : null;
    }
    
    manifestation.title = req.body.title || manifestation.title;
    manifestation.category = req.body.category || manifestation.category;
    manifestation.priority = req.body.priority || manifestation.priority;

    await manifestation.save();
    res.json({ success: true, data: manifestation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// [DELETE] Delete a manifestation (Unchanged)
router.delete('/:id', protect, async (req, res) => {
  try {
    const manifestation = await Manifestation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!manifestation) {
      return res.status(404).json({ success: false, message: 'Manifestation not found.' });
    }
    res.json({ success: true, message: 'Manifestation deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
