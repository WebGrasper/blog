const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Can't be blank"],
    minLength: [4, "The minimum length is 4 character"],
    maxLength: [20, "The maximum length is 20 character"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Can't be blank"],
    match: [/\S+@\S+\.\S+/, "Invalid email"],
  },
  avatar: String,
  password: {
    type: String,
    required: true,
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,1024}$/,
      "The password should be minimum of 8 characters, which consist atleast one Upper, one Lower case alphabet, one number and one special character[!@#$%^&*].",
    ],
  },
  otp: Number,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: String,
    default: "user",
  },
  dob: String,
  bio:String,
  street: String,
  city: String,
  state: String,
  country: String,
});

userSchema.methods.getresetPasswordToken = function () {
  // let resetToken = crypto.randomBytes(32).toString("hex");
  let resetToken = Math.floor(100000 + Math.random() * 900000);
  // this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordToken = resetToken;
  // Calculate the current time in milliseconds since Unix epoch

  const newTime = new Date(Date.now() + 5.75 * 60 * 60 * 1000);

  this.resetPasswordExpire = newTime;
  return resetToken;
};

userSchema.methods.getOtp = function () {
  // let resetToken = crypto.randomBytes(32).toString("hex");
  let get_otp = Math.floor(100000 + Math.random() * 900000);
  // this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.otp = get_otp;
  
  const newTime = new Date(Date.now() + 5.75 * 60 * 60 * 1000);

  this.otpExpiry = newTime;
  return get_otp;
};

module.exports = mongoose.model("user", userSchema);
