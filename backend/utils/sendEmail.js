const nodemailer = require("nodemailer");
const ErrorHandler = require("../utils/errorHandler");

const sendEmail = async function(data,next){
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        secure:false, //true for port 465, false for other ports.
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    
    const mailDetails = {
        from: "noreplyblog@gmail.com",
        to: `${data.recieverEmailID}`,
        subject: "Reset password",
        text: `Click on this link to reset your password :\n \n ${data.tokenUrl} \n\n Link will be expire in 15 mins. \n \nIf you are not requested then please ignore it!`,
    }

    await transporter.sendMail(mailDetails);
}

module.exports = sendEmail;