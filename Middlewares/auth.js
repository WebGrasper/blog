const JWT = require('jsonwebtoken');
const userModel = require('../Models/userModel');
const ErrorHandler = require('../utils/errorHandler');

module.exports.isAuthenticated = async (req, res, next) => {
  let token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return next(new ErrorHandler(401, 'Please login to access this resource.'));
  }

  try {
    const decodedData = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await userModel.findById(decodedData.id).select('-password');
    if (!req.user) {
      return next(new ErrorHandler(401, 'User belonging to this token no longer exists.'));
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandler(401, 'Your session has expired. Please login again.'));
    }
    return next(new ErrorHandler(401, 'Invalid authentication token.'));
  }
};

module.exports.isAuthorizedUser = (req, res, next) => {
  if (!req.user?.role?.includes('admin')) {
    return next(new ErrorHandler(403, 'You are not authorized to access this resource.'));
  }
  next();
};