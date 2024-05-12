const nodemailer = require("nodemailer");
const {google} = require('googleapis');

const sendEmail = async function(data,next){

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI)
    oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})

    try{
        const accessToken = await oAuth2Client.getAccessToken();
        
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth:{
                type: 'OAuth2',
                user: process.env.SMTP_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const mailDetails = {
            from: "noreplyblog@gmail.com",
            to: `${data.recieverEmailID}`,
            subject: `${data.subject}`,
            text: `This is your OTP: \n \n ${data.otp} \n\n It will be expire in 15 mins. \n \nIn case, if you are not requested then please ignore it!`,
        }
        
        const result = await transporter.sendMail(mailDetails);
        return result
    } catch(e){
        return e;
    }
    

}

module.exports = sendEmail;