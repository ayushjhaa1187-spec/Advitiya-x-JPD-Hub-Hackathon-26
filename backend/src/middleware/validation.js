const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
        timestamp: new Date().toISOString(),
      });
    }
    req.validatedData = value;
    next();
  };
};

module.exports = { validateRequest };
