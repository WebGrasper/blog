const jwt = require("jsonwebtoken");

//Sending JWT Token.
const sendToken = async (user, statuscode, res, message) => {
    //extracting ObjectID of Current User.
    let ID = user.id.toString();

    //Creating the Token with using ObjectID.
    let token = jwt.sign({ id: ID }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(statuscode).cookie('token', token,{
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }).json({
        success: true,
        user: user,
        token:token,
        message: message,
    })
}

module.exports = sendToken;