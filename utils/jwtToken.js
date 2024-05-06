const jwt = require("jsonwebtoken");

//Sending JWT Token.
const sendToken = async (user, statuscode, res, message) => {
    //extracting ObjectID of Current User.
    let ID = user.id.toString();
    // console.log(user);

    //Creating the Token with using ObjectID.
    let token = jwt.sign({ id: ID }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    console.log(token);
    res.status(statuscode).cookie('token', token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    }).json({
        success: true,
        user: user,
        token:token,
        message: message,
    })
}

module.exports = sendToken;