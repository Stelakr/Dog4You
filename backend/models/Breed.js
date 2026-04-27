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

/*   lifeExpectancy: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  }, */

  affectionateWithFamily: { type: Number, min: 1, max: 5 },
  goodWithKids: { type: Number, min: 1, max: 5 },
  goodWithOtherDogs: { type: Number, min: 1, max: 5 },
  droolingLevel: { type: Number, min: 1, max: 5 },
  barkingLevel: { type: Number, min: 1, max: 5 },
  shedding: { type: Number, min: 1, max: 5 },
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
    type: [String],
    enum: ['curly', 'smooth', 'double', 'wiry', 'hairless', 'wavy', 'silky', 'corded', 'rough'],
    set: v => (Array.isArray(v) ? v : (v ? [v] : []))
  },

  coatLength: {
    type: [String],
    enum: ['short', 'medium', 'long'],
    set: v => (Array.isArray(v) ? v : (v ? [v] : []))
  },

  livingEnvironment: {
    type: [String],
    enum: ['urban', 'suburban', 'rural']
  },

  description: {
  type: String,
  trim: true,
  maxlength: 2000
},

breedGroup: {
  type: String,
  enum: ['sporting', 'hound', 'working', 'terrier', 'toy', 'non-sporting', 'herding', 'mixed'],
  default: 'mixed'
  },

  
traits: {
  type: [String],
  default: []
  },



  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for size category
breedSchema.virtual('sizeCategory').get(function () {
  const height = this.height?.max;
  if (height === undefined || height === null) return null;
  if (height < 40) return 'small';
  if (height >= 40 && height <= 60) return 'medium';
  return 'large';
});


// Keep nameLower in sync
breedSchema.pre('save', function (next) {
  if (this.name) {
    this.nameLower = this.name.toLowerCase();
  }
  next();
});

// Indexes for performance;
breedSchema.index({ energyLevel: 1 });
breedSchema.index({ trainability: 1 });
breedSchema.index({ barkingLevel: 1 });
breedSchema.index({ shedding: 1 });

module.exports = mongoose.model('Breed', breedSchema);
