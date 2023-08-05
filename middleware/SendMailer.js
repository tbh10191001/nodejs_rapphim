const nodemailer = require('nodemailer');
require('dotenv').config();

const SendMailer = async ({ email, newPassword }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            port: process.env.HOST_MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.HOST_MAIL,
                pass: process.env.HOST_MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: true,
            },
        });

        // const mailOptions = {
        //     from: 'CGV 👻',
        //     to: email,
        //     subject: 'This is your new password from CGV',
        //     text: 'Your new password',
        //     html: `<b>Your new password: ${newPassword}</b>`,
        // };

        const mailOptions = {
            from: process.env.HOST_MAIL,
            to: email,
            subject: 'Filmax xin chào bạn',
            generateTextFromHTML: true,
            text: 'Your new password',
            html: `<div>
            <div>
            <span style="font-size: 30px; font-weight: bold">Xin chào bạn</span>
            </br>
            </br>
            <p style="font-size: 22px, font-weight: 600">Vui lòng nhập mật khẩu mới của bạn để đăng nhập vào trang web của chúng tôi</p>
          <span>Đây là mật khẩu mới của bạn: </span>
          <span style='font-weight: bold'>${newPassword}</span>
          </div>
           <p style="font-size: 22px, font-weight: 600">Filmax kính chúc quí khách một ngày tốt lành </p>
          </div>`,
        };

        const data = await transporter.sendMail(
            mailOptions,
            function (err, data) {
                if (err) {
                    console.log('Error ' + err);
                } else {
                    console.log('Email sent successfully');
                }
                transporter.close();
            },
        );
        console.log(data);
    } catch (err) {
        console.log(err);
    }
};

module.exports = { SendMailer };
