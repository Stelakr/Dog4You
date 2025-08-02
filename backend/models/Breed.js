const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nameLower: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },

  height: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  weight: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  lifeExpectancy: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  affectionateWithFamily: { type: Number, min: 1, max: 5 },
  goodWithYoungChildren: { type: Number, min: 1, max: 5 },
  goodWithOtherDogs: { type: Number, min: 1, max: 5 },
  droolingLevel: { type: Number, min: 1, max: 5 },
  opennessToStrangers: { type: Number, min: 1, max: 5 },
  protectiveNature: { type: Number, min: 1, max: 5 },
  playfulnessLevel: { type: Number, min: 1, max: 5 },
  adaptabilityLevel: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  trainability: { type: Number, min: 1, max: 5 },

  groomingFrequency: {
    value: { type: Number },
    unit: { type: String, enum: ['week', 'month'], default: 'week' }
  },

  coatType: {
    type: String,
    enum: ['curly', 'smooth', 'double', 'wire', 'hairless']
  },

  coatLength: {
    type: String,
    enum: ['short', 'medium', 'long']
  },

  livingEnvironment: {
    type: [String],
    enum: ['urban', 'suburban', 'rural']
  },

  commonHealthIssues: [{
    name: { type: String },
    prevalence: { type: Number, min: 1, max: 5 }
  }],

  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for size category
breedSchema.virtual('sizeCategory').get(function () {
  const height = this.height?.max;
  if (height === undefined) return null;
  if (height < 30) return 'small';
  if (height >= 30 && height <= 55) return 'medium';
  return 'large';
});

// Keep nameLower in sync
breedSchema.pre('save', function (next) {
  if (this.name) {
    this.nameLower = this.name.toLowerCase();
  }
  next();
});

// Indexes for performance
breedSchema.index({ name: 1 });
breedSchema.index({ nameLower: 1 });

module.exports = mongoose.model('Breed', breedSchema);
