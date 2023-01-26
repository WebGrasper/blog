
const sendToken = async(user,statuscode,res)=>{
    let token = user.getJWTtoken();
    res.status(statuscode).cookie('token',token,{
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 5 * 60 * 60 * 1000),
    }).json({
        success:true,
        message:"Login successfully",
    })
}

module.exports = sendToken;