const ErrorHandler = require('../utils/errorHandler');

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    // console.log(err);
    if (err.name === "CastError") {
        err = new ErrorHandler(400, `Resources not found, Invalid ${req.path} !`);
    }
    if(err.name === "JsonWebTokenError"){
        err = new ErrorHandler(400, "Token is invalid, try again!");
    }
    if(err.name === "TokenExpiredError"){
        err = new ErrorHandler(400, "Token is invalid, try again!");
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}