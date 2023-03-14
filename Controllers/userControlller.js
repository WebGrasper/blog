const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const userModel = require("../Models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const { uploadImagesViaImageKit } = require("../utils/imageKit");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");

module.exports.signup = catchAsyncError(async (req, res, next) => {
    //Checking if requesting user is already exists via email.
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
        return next(new ErrorHandler(302, "User already exist!"));
    }
    let { username, email, password } = req.body;
    //registering a new user.
    await userModel.create({
        username,
        email,
        password
    });

    //Encrypting and updating password when normal password successfully passes the mongoose matching parsing.
    await userModel.findOneAndUpdate({ email: req.body.email }, { password: await bcryptjs.hash(password, 12) }, { new: true });

    res.status(201).json({
        success: true,
        message: "Saved user successfully",
    })
});

module.exports.signin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) {
        let isPassword = await bcryptjs.compare(password, user.password);
        if (isPassword) {
            sendToken(user, 200, res, "Login Successfully");
        } else {
            return next(new ErrorHandler(401, `Invalid login details,password!`));
        }
    } else {
        return next(new ErrorHandler(401, `Invalid login details,email!`));
    }
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

//Getting all users details.
module.exports.getAllUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await userModel.find();
    res.status(200).json({
        success: true,
        user,
    })
});

//Getting single user detail using ObjectID.
module.exports.getSingleUserDetails = catchAsyncError(async (req, res, next) => {
    let user = await userModel.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(404, "The user not found!"));
    }
    res.status(201).json({
        success: true,
        message: "Saved user successfully",
    })
})

//Getting current user details.
module.exports.getMyDetails = catchAsyncError(async (req, res, next) => {
    let user = await userModel.findById(req.user.id);
    res.status(201).json({
        success: true,
        user,
    })
})

module.exports.updateMyDetails = catchAsyncError(async (req, res, next) => {
    await userModel.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).then((article) => {
        console.log(article);
        res.status(200).json({
            success: true,
            message: "Update user details successfully!",
        })
    }).catch((err) => {
        return next(new ErrorHandler(302, `${err.errors.username || err.errors.email}`));

    })
})

module.exports.updateMyAvatar = catchAsyncError(async (req, res, next) => {
    const avatarData = req.file;
    let url = await uploadImagesViaImageKit(avatarData.buffer, avatarData.originalname);
    let user = await userModel.findByIdAndUpdate(req.user.id, { avatar: url }, { new: true });
    if (!user) {
        return next(new ErrorHandler(302, `Profile picture cannot change, please try again!`));
    }
    res.status(201).json({
        success: true,
        message: `Profile picture update successfully ${url}`,
    })
})

//Updating password using old-password.
module.exports.updatePassword = catchAsyncError(async (req, res, next) => {
    let { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword || (oldPassword === undefined || newPassword === undefined || confirmPassword === undefined)) {
        return next(new ErrorHandler(401, "Please fill the fields properly!"));
    }
    let storedPassword = await bcryptjs.compare(oldPassword, req.user.password);
    if (!storedPassword) {
        return next(new ErrorHandler(401, "old password not matched!"));
    }
    let user = await userModel.findByIdAndUpdate(req.user.id, { new: true, runValidators: true }, {
        password: await bcryptjs.hash(newPassword, 12),
    })
    if (!user) {
        return next(new ErrorHandler(401, "Password cannot update!"));
    }
    sendToken(user, 200, res, "Update password successfully");
})

//Forget password without loggin.
module.exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler(404, "User does not exist!"));
    }
    let resetToken = user.getresetPasswordToken();
    await user.save({ validateBeforeSave: false });
    let data = {
        recieverEmailID: user.email,
        tokenUrl: `${req.protocol}://${req.get("host")}/app/v1/reset/password/${resetToken}`
    }
    try {
        await sendEmail(data);
        res.status(200).json({
            success: true,
            message: `Email send successfully to ${user.email}`,
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(324, `Email cannot send due to internal problem! ${error}`));
    }
})

module.exports.resetPassword = catchAsyncError(async (req, res, next) => {
    let resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    let user = await userModel.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }, });
    if (!user) {
        return next(new ErrorHandler(401, "The token is invalid or expired!"));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler(401, "Both passwords are not matching each other, please try again!"));
    }
    user.password = await bcryptjs.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "password changed successfully!",
    })
})
