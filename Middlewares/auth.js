const JWT = require('jsonwebtoken');
const userModel = require("../Models/userModel");
const ErrorHandler = require("../utils/errorHandler");

// Authenticating the User with Token from cookies, headers, or query.
module.exports.isAuthenticated = async (req, res, next) => {
    let token = req.cookies.token || req.query.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token || token.trim() === '') {
        return next(new ErrorHandler(401, `Please login to access this resources!`));
    }

    try {
        let decodedData = JWT.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await userModel.findById(decodedData.id);
        if (!req.user) {
            return next(new ErrorHandler(401, "User not found with this token"));
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler(401, `Your session has expired`));
        } else {
            return next(new ErrorHandler(401, `Invalid token`));
        }
    }
}


module.exports.isAuthorizedUser = async (req, res, next) => {
    if (!req.user.role.includes("admin")) {
        return next(new ErrorHandler(404,`You are not authorized to access this resource!`));
    }
    next();
}