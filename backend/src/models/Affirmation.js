const mongoose = require('mongoose');

const affirmationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }
}, { timestamps: true });

module.exports = mongoose.model('Affirmation', affirmationSchema);