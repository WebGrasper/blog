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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,1024}$/,"The password should be minimum of 8 characters, which consist atleast one Upper, one Lower case alphabet, one number and one special character[!@#$%^&*]."]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: String,
    default: "user",
  },
});




userSchema.methods.getresetPasswordToken = function(){
  let resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
}


module.exports = mongoose.model("user", userSchema);
