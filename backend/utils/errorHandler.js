module.exports.success = (res,statusCode,flag,message)=>{
    if (typeof message === "string") {
        res.status(statusCode).json({
            success: flag,
            message:message
        })
    } else if(typeof message === "object"){
        res.status(statusCode).json({
            success: flag,
            message
        })
        // console.log(message[1]._id.toString());
    }
}

module.exports.failure = (res,statusCode,flag,message)=>{
    res.status(statusCode).json({
        success: flag,
        message:message
    })
}