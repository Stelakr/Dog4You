const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be string or number
    required: true
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  trait: {
    type: String,
    enum: [
      'energyLevel', 'sizeCategory', 'goodWithKids', 'goodWithOtherDogs',
      'trainability', 'barkingLevel', 'droolingLevel',
      'opennessToStrangers', 'protectiveNature', 'adaptabilityLevel',
      'playfulnessLevel', 'coatType', 'coatLength', 'affectionateWithFamily',
      'lifeExpectancy', 'weight', 'height', 'shedding',
      'groomingFrequency', 'apartmentFriendly', 'livingEnvironment'
    ],
    required: true
  },

  category: {
    type: String,
    enum: ['lifestyle', 'preferences', 'constraints'],
    required: true
  },

  options: {
    type: [optionSchema],
    required: true
  },

/*   allowDealbreaker: {
    type: Boolean,
    default: true
  }, */


  order: {
    type: Number,
    min: 1
  }

}, { timestamps: true });

questionSchema.index({trait: 1, category: 1 });

module.exports = mongoose.model('Question', questionSchema);

