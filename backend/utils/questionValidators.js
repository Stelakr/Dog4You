// /utils/questionValidators.js
const { body } = require('express-validator');

exports.questionValidators = [
  body('text')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Question text must be between 5 and 200 characters'),

  body('options')
    .isArray({ min: 1 })
    .withMessage('Options are required')
    .bail()
    .custom((options) => {
      for (const opt of options) {
        if (!opt || typeof opt.label !== 'string' || typeof opt.value === 'undefined') {
          throw new Error('Each option must have a label and value');
        }
      }
      return true;
    }),

  body('trait')
    .isIn([
      'size', 'energyLevel', 'groomingFrequency', 'apartmentFriendly',
      'goodWithKids', 'goodWithOtherDogs', 'trainability', 'shedding',
      'barkingLevel', 'droolingLevel', 'opennessToStrangers',
      'protectiveNature', 'adaptabilityLevel', 'playfulnessLevel',
      'coatType', 'coatLength', 'lifeExpectancy', 'weight', 'height' ,
      'livingEnvironment'
    ])
    .withMessage('Invalid trait name'),

  body('category')
    .isIn(['lifestyle', 'preferences', 'constraints'])
    .withMessage('Invalid question category'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
/*   body('allowDealbreaker')
    .optional()
    .isBoolean()
    .withMessage('allowDealbreaker must be true or false') */

];
