const { validationResult } = require('express-validator');

module.exports = function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ success: false, error: msg });
  }
  next();
};
