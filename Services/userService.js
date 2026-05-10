const userModel = require("../Models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const bcryptjs = require("bcryptjs");

/**
 * Service to handle User & Auth operations
 */
const userService = {
    /**
     * Signup a new user
     */
    signup: async (userData) => {
        const { username, email, password, role } = userData;

        // Check if user exists
        const existingUser = await userModel.findOne({ email, otp: { $exists: false } });
        if (existingUser) {
            throw new ErrorHandler(302, "User already exist!");
        }

        // Create or update unverified user
        const user = await userModel.findOneAndUpdate(
            { email },
            { 
                username, 
                email, 
                password, // Will be hashed by pre-save hook
                role,
                avatar: "https://ik.imagekit.io/94nzrpaat/webgrasper-user-avatars/default-user-avatar.png?updatedAt=1718087648181"
            },
            { upsert: true, new: true, runValidators: true }
        );

        const otp = user.getOtp();
        await user.save({ validateBeforeSave: false });

        // Send email
        await sendEmail({
            subject: "OTP for registration",
            recieverEmailID: user.email,
            otp: otp,
        });

        return user;
    },

    /**
     * Confirm registration with OTP
     */
    confirmRegistration: async (otp) => {
        const currentTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // Matching existing logic
        const user = await userModel.findOne({
            otp: otp,
            otpExpiry: { $gt: currentTime },
        });

        if (!user) {
            throw new ErrorHandler(401, "The token is invalid or expired!");
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        
        return user;
    },

    /**
     * Signin user
     */
    signin: async (email, password) => {
        const user = await userModel.findOne({ email }).select("+password");
        
        if (!user) {
            throw new ErrorHandler(401, "Invalid login details!");
        }

        // Check if verified
        if (user.otp) {
            throw new ErrorHandler(401, "Please verify your account!");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ErrorHandler(401, "Invalid login details!");
        }

        return user;
    },

    /**
     * Update user details
     */
    updateDetails: async (userId, updateData) => {
        const user = await userModel.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });
        
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }
        
        return user;
    },

    /**
     * Update password
     */
    updatePassword: async (userId, oldPassword, newPassword) => {
        const user = await userModel.findById(userId).select("+password");
        
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            throw new ErrorHandler(401, "Old password not matched!");
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        
        return user;
    }
};

module.exports = userService;
