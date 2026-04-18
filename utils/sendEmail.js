const nodemailer = require("nodemailer");

const sendEmail = async function(data,next){

    try{
        
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        const mailDetails = {
            from: "noreplyblog@gmail.com",
            to: `${data.recieverEmailID}`,
            subject: `${data.subject}`,
            text: `This is your OTP: \n \n ${data.otp} \n\n It will be expire in 15 mins. \n \nIn case, if you are not requested then please ignore it!`,
        }
        
        const result = await transporter.sendMail(mailDetails);
        return result;
    } catch(e){
        return e;
    }
    

}

module.exports = sendEmail;