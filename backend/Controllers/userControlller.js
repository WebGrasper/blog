const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const userModel = require("../Models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");

module.exports.signup = async (req, res) => {
    //Checking if requesting user is already exists via email.
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
        return next(ErrorHandler.failure(res, 302, false, "User already exist!"));

    } else {
        let { username, email, password } = req.body;

        //Encryption for password.
        password = await bcryptjs.hash(password, 12);

        //registering a new user.
        let user = await userModel.create({
            username,
            email,
            password,
        });
        return next(ErrorHandler.success(res, 201, true, "Saved user Successfully!"));
    }
};

module.exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) {
        let isPassword = await bcryptjs.compare(password, user.password);
        if (isPassword) {
            sendToken(user, 200, res, "Login Successfully");
        } else {
            return next(ErrorHandler.failure(res, 401, false, "Invalid login details!"));
        }
    } else {
        return next(ErrorHandler.failure(res, 401, false, "Invalid login details!"));
    }
};

module.exports.logout = async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logout successfully!",
    });
};

//Getting all users details.
module.exports.getAllUserDetails = async (req, res, next) => {
    const user = await userModel.find();
    return next(ErrorHandler.success(res, 200, true, user));
};

//Getting single user detail using ObjectID.
module.exports.getSingleUserDetails = async (req, res, next) => {
    let user = await userModel.findById(req.params.id);
    if (!user) {
        return next(ErrorHandler.failure(res, 404, false, "The user not found!"));
    }
    return next(ErrorHandler.success(res, 200, true, user));
}

//Getting current user details.
module.exports.getMyDetails = async (req, res, next) => {
    let user = await userModel.findById(req.user.id);
    return next(ErrorHandler.success(res, 200, true, user));
}

//Updating password using old-password.
module.exports.updatePassword = async (req, res, next) => {
    let { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword || (oldPassword === undefined || newPassword === undefined || confirmPassword === undefined)) {
        return next(ErrorHandler.failure(res, 401, false, "Please fill the fields properly!"));
    }
    let storedPassword = await bcryptjs.compare(oldPassword, req.user.password);
    if (!storedPassword) {
        return next(ErrorHandler.failure(res, 401, false, "old password not matched!"));
    }
    let user = await userModel.findByIdAndUpdate(req.user.id, {
        password: await bcryptjs.hash(newPassword, 12),
    })
    if (!user) {
        return next(ErrorHandler.failure(res, 401, false, "Password cannot update!"));
    }
    sendToken(user, 200, res, "Update password successfully");
}

//Forget password without loggin.
module.exports.forgetPassword = async (req, res, next) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(ErrorHandler.failure(res, 404, false, "User does not exist!"));
    }
    let resetToken = user.getresetPasswordToken();
    await user.save({ validateBeforeSave: false });
    let data = {
        recieverEmailID: user.email,
        tokenUrl: `${req.protocol}://${req.get("host")}/app/v1/reset/password/${resetToken}`
    }
    try {
        await sendEmail(data);
        return next(ErrorHandler.success(res, 200, true, `Email send successfully to ${user.email}`));
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(ErrorHandler.failure(res, 324, false, `Email not send successfully! ${error}`));
    }
}

module.exports.resetPassword = async (req, res, next) => {
    let resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    let user = await userModel.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }, });
    if (!user) {
        return next(ErrorHandler.failure(res, 401, false, "The token is invalid or expired!"));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(ErrorHandler.failure(res, 401, false, "Both passwords are not matching each other, please try again!"));
    }
    user.password = await bcryptjs.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(ErrorHandler.success(res, 200, true, "password changed successfully!"));
}
