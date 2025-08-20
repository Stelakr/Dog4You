// /backend/utils/requestValidators.js
const { body } = require('express-validator');

const ALLOWED_TRAITS = [
  'energyLevel','sizeCategory','goodWithKids','goodWithOtherDogs',
  'trainability','barkingLevel','droolingLevel',
  'opennessToStrangers','protectiveNature','adaptabilityLevel',
  'playfulnessLevel','coatType','coatLength',
  'lifeExpectancy','weight','height','shedding',
  'groomingFrequency','apartmentFriendly','livingEnvironment'
];

const validateRecommend = [
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.trait')
    .isString().withMessage('trait must be a string')
    .isIn(ALLOWED_TRAITS).withMessage('invalid trait'),
  body('answers.*.value').custom((v) => {
    const okScalar = (x) => ['number','string'].includes(typeof x);
    const ok = okScalar(v) || (Array.isArray(v) && v.length > 0 && v.every(okScalar));
    if (!ok) throw new Error('value must be number/string or array of them');
    return true;
  }),
  body('answers.*.dealbreaker').optional().isBoolean(),
  body('answers.*.mode').optional().isIn(['accept','exclude'])
];

const validateExplainTrait = [
  body('trait').isString().trim().isLength({ min: 2 }).withMessage('trait is required')
];

const validateWhyMatch = [
  body('breed').isString().trim().isLength({ min: 2 }).withMessage('breed is required'),
  body('matchPercentage').isFloat({ min: 0, max: 100 }).withMessage('matchPercentage 0..100'),
  body('answers').isArray().withMessage('answers must be an array')
];

const validateWhyNot = [
  body('breed').isString().trim().isLength({ min: 2 }).withMessage('breed is required'),
  body('answers').isArray().withMessage('answers must be an array')
];

const validateCareTips = [
  body('breed').isString().trim().isLength({ min: 2 }).withMessage('breed is required')
];

const validateSuggestBreed = [
  body('input').isString().trim().isLength({ min: 1 }).withMessage('input is required')
];

module.exports = {
  validateRecommend,
  validateExplainTrait,
  validateWhyMatch,
  validateWhyNot,
  validateCareTips,
  validateSuggestBreed
};
