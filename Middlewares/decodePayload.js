const ErrorHandler = require('../utils/errorHandler');

module.exports.decodePayload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  if (!req.body || !req.body.payload) {
    return next();
  }

  try {
    const decoded = Buffer.from(req.body.payload, 'base64').toString('utf-8');
    req.body = JSON.parse(decoded);
    next();
  } catch (err) {
    return next(new ErrorHandler(400, 'Malformed payload: invalid Base64 encoding.'));
  }
};
