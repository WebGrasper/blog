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
                pass: process.env.SMTP_PASS
            }
        });
        const mailDetails = {
            from: `"WebGrasper" <${process.env.SMTP_USER}>`,
            to: `${data.recieverEmailID}`,
            subject: `${data.subject}`,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #a16666; margin: 0; font-size: 28px; letter-spacing: 1px;">Web<span style="color: #1a1a1a;">Grasper</span></h1>
                        <div style="width: 50px; height: 2px; background-color: #a16666; margin: 15px auto;"></div>
                    </div>
                    
                    <h2 style="color: #1a1a1a; font-size: 20px; text-align: center; margin-bottom: 10px;">Verify Your Email</h2>
                    <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 30px; line-height: 1.5;">
                        Thank you for joining WebGrasper. Use the following code to complete your registration.
                    </p>
                    
                    <div style="background-color: #f4f4f4; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a1a1a; font-family: monospace;">${data.otp}</span>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; text-align: center; margin-bottom: 20px;">
                        This code will expire in <strong>15 minutes</strong>.
                    </p>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                        <p style="color: #bfbfbf; font-size: 12px; line-height: 1.4;">
                            If you did not request this email, you can safely ignore it. This is an automated message, please do not reply.
                        </p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #bfbfbf; font-size: 12px;">&copy; ${new Date().getFullYear()} WebGrasper. All rights reserved.</p>
                </div>
            </div>
            `,
        }

        const result = await transporter.sendMail(mailDetails);
        console.log("Email sent successfully:", result.messageId);
        return result;
    } catch(e){
        return e;
    }
    

}

module.exports = sendEmail;