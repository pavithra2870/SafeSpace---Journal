const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  totalEntries: {
    type: Number,
    default: 0
  },
  moodStats: {
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    excited: { type: Number, default: 0 },
    calm: { type: Number, default: 0 },
    anxious: { type: Number, default: 0 },
    joyful: { type: Number, default: 0 },
    tired: { type: Number, default: 0 }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminder: { type: Boolean, default: true }
    },
    privacy: {
      profilePublic: { type: Boolean, default: false },
      entriesPublic: { type: Boolean, default: false }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ points: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update points
userSchema.methods.addPoints = function(points) {
  this.points += points;
  return this.save();
};

// Method to update mood stats
userSchema.methods.updateMoodStats = function(mood, intensity = 1) {
  if (this.moodStats[mood] !== undefined) {
    this.moodStats[mood] += intensity;
  }
  return this.save();
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  // Normalize today's date to the beginning of the day (midnight)
  today.setHours(0, 0, 0, 0);

  // If there's no last active date, this is the first day of the streak
  if (!this.lastActive) {
    this.streak = 1;
    this.lastActive = new Date();
    return this.save();
  }

  const lastActiveDate = new Date(this.lastActive);
  // Also normalize the last active date to the beginning of its day
  lastActiveDate.setHours(0, 0, 0, 0);

  // Calculate the difference in milliseconds and convert to days
  const diffTime = today - lastActiveDate;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // This is a consecutive day, so increase the streak
    this.streak += 1;
  } else if (diffDays > 1) {
    // The streak was broken (more than 1 day has passed), so reset to 1
    this.streak = 1;
  }
  // If diffDays is 0, it's the same day, so we do nothing to the streak.

  // Update the last active date to today's date
  this.lastActive = new Date();

  // Save the user document with the updated streak and last active date
  return this.save();
};

// Virtual for user level based on points
userSchema.virtual('level').get(function() {
  return Math.floor(this.points / 100) + 1;
});

// Virtual for progress to next level
userSchema.virtual('progressToNextLevel').get(function() {
  const currentLevel = this.level;
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const progress = ((this.points - pointsForCurrentLevel) / 100) * 100;
  return Math.min(100, Math.max(0, progress));
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 