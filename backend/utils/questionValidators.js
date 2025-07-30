// /utils/questionValidators.js
const { body } = require('express-validator');

exports.questionValidators = [
  body('text')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Question text must be between 5 and 200 characters'),

  body('type')
    .isIn(['single-choice', 'multiple-choice', 'boolean', 'scale'])
    .withMessage('Invalid question type'),

  body('options').custom((options, { req }) => {
    const type = req.body.type;

    // Boolean questions should not have options
    if (type === 'boolean' && options?.length > 0) {
      throw new Error('Boolean questions should not have options');
    }

    // Other types should have options
    if (type !== 'boolean' && (!options || options.length === 0)) {
      throw new Error('Options are required for this question type');
    }

    // Check option structure
    if (Array.isArray(options)) {
      for (let opt of options) {
        if (!opt.label || !opt.value) {
          throw new Error('Each option must have a label and value');
        }
      }
    }

    return true;
  }),

  body('trait')
    .optional()
    .isIn([
      'size', 'energyLevel', 'groomingFrequency', 'apartmentFriendly',
      'goodWithKids', 'goodWithDogs', 'trainability', 'shedding',
      'barkingLevel', 'droolingLevel', 'opennessToStrangers',
      'protectiveNature', 'adaptabilityLevel', 'playfulnessLevel',
      'coatType', 'coatLength', 'lifeExpectancy', 'weight', 'height'
    ])
    .withMessage('Invalid trait name'),

  body('category')
    .isIn(['lifestyle', 'preferences', 'constraints'])
    .withMessage('Invalid question category'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),

  body('dealbreaker')
    .optional()
    .isBoolean()
    .withMessage('Dealbreaker must be true or false'),

  body('notImportant')
    .optional()
    .isBoolean()
    .withMessage('notImportant must be true or false'),

  body('required')
    .optional()
    .isBoolean()
    .withMessage('Required must be true or false')
];
