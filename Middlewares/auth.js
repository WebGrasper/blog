const JWT = require('jsonwebtoken');
const userModel = require("../Models/userModel");
const ErrorHandler = require("../utils/errorHandler");

//Authenticating the User with Token from cookies.
module.exports.isAuthenticated = async (req, res, next) => {
    let token = req.query.token;
    if (token.trim() === '') {
        return next(new ErrorHandler(404,`Please login to access this resources!`));
    }
    try {
        let decodedData = JWT.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await userModel.findById(decodedData.id);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler(404, `Your session has expired`));
        } else {
            return next(new ErrorHandler(500, `A server error has occurred`));
        }
    }
}


module.exports.isAuthorizedUser = async (req, res, next) => {
    if (!req.user.role.includes("admin")) {
        return next(new ErrorHandler(404,`You are not authorized to access this resource!`));
    }
    next();
}