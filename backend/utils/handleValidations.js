// /backend/utils/handleValidations.js
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Validation errors:', result.array(), 'BODY:', JSON.stringify(req.body));
    return res.status(400).json({ success: false, error: 'Invalid request', details: result.array() });
  }
  return res.status(400).json({ success: false, error: 'Invalid request' });
};
