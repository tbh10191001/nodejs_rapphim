const nodemailer = require("nodemailer");
const {google} = require("googleapis")
const {OAuth2Client} = require("google-auth-library")
require('dotenv').config()

const user = process.env.HOST_MAIL
const password = process.env.HOST_MAIL_PASSWORD
const port = process.env.HOST_MAIL_PORT
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const redirectURI = process.env.REDIRECT_URI
const refreshToken = process.env.REFESH_TOKEN


const oAuth2Client = new OAuth2Client(clientID, clientSecret)
oAuth2Client.setCredentials({refreshToken: refreshToken})

const sendMail = async ({newPassword, email}) => {
    try {
        console.log(typeof refreshToken)
        
        const accessToken = await oAuth2Client.getAccessToken()
        console.log('accessToken', accessToken)
        console.log(1)
        console.log(email)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            // port: port,
            // secure: false,
            auth: {
                type: "OAuth2",
                user: user,
                clientID: clientID,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken,
            }
        })

        const mailOptions = {
            from: "CGV 👻", 
            to: email, 
            subject: "This is your new password from CGV", 
            text: "Your new password", 
            html: `<b>Your new password: ${newPassword}</b>`,
        }

        await transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
            } else {
              console.log("Email sent successfully");
            }
        });

        
    }
    catch(err) {
        console.log(err)
    }
}

module.exports = {sendMail}