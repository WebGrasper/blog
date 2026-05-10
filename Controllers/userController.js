const userService = require("../Services/userService");
const imageService = require("../Services/imageService");
const sendResponse = require("../utils/responseHandler");
const sendToken = require("../utils/jwtToken");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const userModel = require("../Models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");

/**
 * User Controller - Handles request/response and delegates to Services
 */

module.exports.signup = catchAsyncError(async (req, res, next) => {
    const user = await userService.signup(req.body);
    sendResponse(res, 200, `Email send successfully to ${user.email}`);
});

module.exports.confirmRegistration = catchAsyncError(async (req, res, next) => {
    await userService.confirmRegistration(req.body.otp);
    sendResponse(res, 200, "User registered successfully!");
});

module.exports.signin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userService.signin(email, password);
    sendToken(user, 200, res, "Login Successfully");
});

module.exports.logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logout successfully!",
    });
});

module.exports.getMyDetails = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findById(req.user.id);
    sendResponse(res, 201, "Success", { user });
});

module.exports.updateMyDetails = catchAsyncError(async (req, res, next) => {
    await userService.updateDetails(req.user.id, req.body);
    sendResponse(res, 200, "Details updated successfully.");
});

module.exports.updateMyAvatar = catchAsyncError(async (req, res, next) => {
    const { email } = await userModel.findById(req.user.id).select("email");
    const url = await imageService.uploadAvatar(req.file, email);
    
    await userService.updateDetails(req.user.id, { avatar: url });
    
    sendResponse(res, 201, "Profile image updated successfully.");
});

module.exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword || !oldPassword || !newPassword) {
        return next(new ErrorHandler(401, "Please fill the fields properly!"));
    }

    const user = await userService.updatePassword(req.user.id, oldPassword, newPassword);
    sendToken(user, 200, res, "Update password successfully");
});

module.exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler(404, "User does not exist!"));
    }
    
    const otp = user.getresetPasswordToken();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        subject: "OTP for reset password",
        recieverEmailID: user.email,
        otp: otp,
    });

    sendResponse(res, 200, `Email send successfully to ${user.email}`);
});

module.exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const { otp, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return next(new ErrorHandler(401, "Both passwords are not matching each other!"));
    }

    const currentTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const user = await userModel.findOne({
        resetPasswordToken: otp,
        resetPasswordExpire: { $gt: currentTime },
    });

    if (!user) {
        return next(new ErrorHandler(401, "The token is invalid or expired!"));
    }

    user.password = password; // Will be hashed by pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendResponse(res, 200, "password changed successfully!");
});

module.exports.getArticlesCreators = catchAsyncError(async (req, res, next) => {
    const { creators } = req.body;
    if (!Array.isArray(creators) || creators.length === 0) {
        return next(new ErrorHandler(400, "Invalid creators IDs."));
    }
    const creators_data = await userModel.find({ _id: { $in: creators } }, "username avatar");
    sendResponse(res, 200, "Success", { creators_data });
});

module.exports.getCommenters = catchAsyncError(async (req, res, next) => {
    const { commenterIds } = req.body;
    if (!Array.isArray(commenterIds) || commenterIds.length === 0) {
        return next(new ErrorHandler(400, "Invalid commenters IDs."));
    }
    const commenters = await userModel.find({ _id: { $in: commenterIds } }, "username avatar");
    sendResponse(res, 200, "Success", { commenters });
});

module.exports.getSingleUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findById(req.query.creatorID);
    if (!user) {
        return next(new ErrorHandler(404, "The user not found!"));
    }
    sendResponse(res, 201, "Success", { user });
});
