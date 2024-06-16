const bcryptjs = require("bcryptjs");
// const crypto = require("crypto");
const userModel = require("../Models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const {
  uploadImagesViaImageKit,
  deleteImagesViaImageKit,
} = require("../utils/imageKit");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const jwt = require("jsonwebtoken");
const error = require("../Middlewares/error");
const assert = require("assert").strict;

module.exports.signup = catchAsyncError(async (req, res, next) => {
  // Checking if requesting user is already exists via email.
  const user = await userModel.findOne({
    email: req.body.email, // check if email exists
    otp: { $exists: false }, // check if otp field does not exist or its value is null
  });
  if (user) {
    return next(new ErrorHandler(302, "User already exist!"));
  }

  let { username, email, password, role } = req.body;

  const userData = await userModel.findOneAndUpdate(
    { email: req.body.email },
    {
      username: username,
      email: email,
      password: password,
      role: role,
      avatar:
        "https://ik.imagekit.io/94nzrpaat/webgrasper-user-avatars/default-user-avatar.png?updatedAt=1718087648181",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  let otp = userData.getOtp();
  // console.log(otp);

  //Encrypting and updating password when normal password successfully passes the mongoose matching parsing.
  await userModel.findOneAndUpdate(
    { email: req.body.email },
    { password: await bcryptjs.hash(password, 12) },
    { new: true }
  );
  await userData.save({ validateBeforeSave: false });

  let data = {
    subject: "OTP for registration",
    recieverEmailID: userData.email,
    otp: otp,
  };

  sendEmail(data)
    .then((result) => {
      res.status(200).json({
        success: true,
        message: `Email send successfully to ${userData.email}`,
      });
    })
    .catch((e) => {
      return new ErrorHandler(
        324,
        `Email cannot send due to internal problem! ${error}`
      );
    });
});

module.exports.confirmRegistration = catchAsyncError(async (req, res, next) => {
  // let registerationOTP = req.body.otp;
  let currentTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  let user = await userModel.findOne({
    otp: req.body.otp,
    otpExpiry: { $gt: currentTime },
  });

  if (!user) {
    return next(new ErrorHandler(401, "The token is invalid or expired!"));
  }
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "User registered successfully!",
  });
});

module.exports.signin = catchAsyncError(async (req, res, next) => {
  const isNotVerified = await userModel.findOne({
    email: req.body.email, // email should exist
    otp: { $exists: true }, // otp should exist
  });

  if (isNotVerified) {
    return next(new ErrorHandler(401, `Please verify your account!`));
  }

  const { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (user) {
    let isPassword = await bcryptjs.compare(password, user.password);
    if (isPassword) {
      sendToken(user, 200, res, "Login Successfully");
    } else {
      return next(new ErrorHandler(401, `Invalid login details!`));
    }
  } else {
    return next(new ErrorHandler(401, `Invalid login details!`));
  }
});

module.exports.logout = catchAsyncError(async (req, res, next) => {
  const tokenInHeader = req.headers.authorization.split(" ")[1]; // Extract token from headers
  const token = req.cookies.token;
  // console.log(tokenInHeader, token);
  if (tokenInHeader === token) {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Logout successfully!",
      });
  } else {
    return next(new ErrorHandler(302, `Cannot logout due to server issue!`));
  }
});

module.exports.testToken = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.token;
  res.status(200).json({
    success: true,
    token: token,
  });
});

//Getting all users details.
module.exports.getAllUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await userModel.find();
  res.status(200).json({
    success: true,
    user,
  });
});

//Getting single user detail using ObjectID.
module.exports.getSingleUserDetails = catchAsyncError(
  async (req, res, next) => {
    let user = await userModel.findById(
      { _id: req.query.creatorID },
      { password: 0 }
    );
    if (!user) {
      return next(new ErrorHandler(404, "The user not found!"));
    }
    res.status(201).json({
      success: true,
      user,
    });
  }
);

//Getting current user details.
module.exports.getMyDetails = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findById(req.user.id, { password: 0 });
  res.status(201).json({
    success: true,
    user,
  });
});

module.exports.updateMyDetails = catchAsyncError(async (req, res, next) => {
  await userModel
    .findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    })
    .then((user) => {
      res.status(200).json({
        success: true,
        message: "Details updated successfully.",
      });
    })
    .catch((err) => {
      return next(new ErrorHandler(302, "Details updation failed."));
    });
});

module.exports.updateMyAvatar = catchAsyncError(async (req, res, next) => {
  const avatarData = req.file;
  let folderPath = "/WG-USERS-PROFILE-IMAGES/";

  let { email } = await userModel.findById(req.user.id).select("email");

  let subFolderPath = email.split('@')[0];

  let mainDestination = folderPath + subFolderPath;

  let url = await uploadImagesViaImageKit(
    avatarData.buffer,
    avatarData.originalname,
    mainDestination
  );
  let user = await userModel.findByIdAndUpdate(
    req.user.id,
    { avatar: url },
    { new: true }
  );
  if (!user) {
    return next(
      new ErrorHandler(302, `Profile picture cannot change, please try again!`)
    );
  }
  res.status(201).json({
    success: true,
    message: `Profile image updated successfully.`,
  });
});

//Updating password using old-password.
module.exports.updatePassword = catchAsyncError(async (req, res, next) => {
  let { oldPassword, newPassword, confirmPassword } = req.body;
  if (
    newPassword !== confirmPassword ||
    oldPassword === undefined ||
    newPassword === undefined ||
    confirmPassword === undefined
  ) {
    return next(new ErrorHandler(401, "Please fill the fields properly!"));
  }
  let storedPassword = await bcryptjs.compare(oldPassword, req.user.password);
  if (!storedPassword) {
    return next(new ErrorHandler(401, "old password not matched!"));
  }
  let hashedPassword = await bcryptjs.hash(newPassword, 12);
  let user = await userModel.findByIdAndUpdate(req.user.id, {
    password: hashedPassword,
  });
  if (!user) {
    return next(new ErrorHandler(401, "Password cannot update!"));
  }
  sendToken(user, 200, res, "Update password successfully");
});

//Forget password without loggin.
module.exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler(404, "User does not exist!"));
  }
  let otp = user.getresetPasswordToken();
  await user.save({ validateBeforeSave: false });
  let data = {
    subject: "OTP for reset password",
    recieverEmailID: user.email,
    otp: otp,
  };
  sendEmail(data)
    .then(async (result) => {
      res.status(200).json({
        success: true,
        message: `Email send successfully to ${user.email}`,
      });
    })
    .catch(async (error) => {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new ErrorHandler(
          324,
          `Email cannot send due to internal problem! ${error}`
        )
      );
    });
});

module.exports.resetPassword = catchAsyncError(async (req, res, next) => {
  console;
  // let resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  let resetPasswordToken = req.body.otp;
  let currentTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  let user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: currentTime },
  });
  // console.log(user, resetPasswordToken, currentTime);
  if (!user) {
    return next(new ErrorHandler(401, "The token is invalid or expired!"));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler(
        401,
        "Both passwords are not matching each other, please try again!"
      )
    );
  }
  // console.log(req.body.password);
  user.password = await bcryptjs.hash(req.body.password, 12);
  // console.log(user.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "password changed successfully!",
  });
});

module.exports.getArticlesCreators = catchAsyncError(async (req, res, next) => {
  const { creators } = req.body;
  if (!Array.isArray(creators) || creators.length === 0) {
    return next(new ErrorHandler(400, "Invalid creators IDs."));
  }
  const creators_data = await userModel.find(
    {
      _id: { $in: creators },
    },
    "username avatar"
  );
  if (!creators_data) {
    return next(
      new ErrorHandler(404, "Failed to fetch details. Please try again.")
    );
  }
  res.status(200).json({ success: true, creators_data });
});

module.exports.getCommenters = catchAsyncError(async (req, res, next) => {
  const { commenterIds } = req.body;
  if (!Array.isArray(commenterIds) || commenterIds.length === 0) {
    return next(new ErrorHandler(400, "Invalid commenters IDs."));
  }
  const commenters = await userModel.find(
    {
      _id: { $in: commenterIds },
    },
    "username avatar"
  );

  if (!commenters) {
    return next(
      new ErrorHandler(404, "Failed to fetch details. Please try again.")
    );
  }
  res.status(200).json({ success: true, commenters });
});
