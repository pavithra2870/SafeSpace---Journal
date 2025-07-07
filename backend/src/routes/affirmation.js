const express = require('express');
const router = express.Router();
const Affirmation = require('../models/Affirmation');
const { protect } = require('../middleware/auth');

// Create an affirmation
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const affirmation = await Affirmation.create({
      user: req.user._id,
      text
    });
    res.status(201).json({ success: true, data: affirmation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all affirmations for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const affirmations = await Affirmation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: affirmations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update an affirmation
router.put('/:id', protect, async (req, res) => {
  try {
    const affirmation = await Affirmation.findOne({ _id: req.params.id, user: req.user._id });
    if (!affirmation) return res.status(404).json({ success: false, message: 'Not found' });
    affirmation.text = req.body.text || affirmation.text;
    await affirmation.save();
    res.json({ success: true, data: affirmation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete an affirmation
router.delete('/:id', protect, async (req, res) => {
  try {
    const affirmation = await Affirmation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!affirmation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;