const nodemailer = require('nodemailer');
const qr = require('qrcode');
require('dotenv').config();

const generateQR = async (text) => {
    try {
        const qrCode = await qr.toDataURL(text);
        return qrCode;
    } catch (err) {
        console.error(err);
    }
};

const QRMailer = async ({ email, info }) => {
    try {
        const qrCode = await generateQR(info);
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

        const mailOptions = {
            from: process.env.HOST_MAIL,
            to: email,
            subject: 'Filmax xin chào bạn',
            attachments: [
                {
                    filename: 'image.png',
                    path: qrCode,
                    cid: 'unique@nodemailer.com',
                },
            ],
            text: 'Your QRCode',
            html: `<div>
                    <div style="font-size: 18px; font-weight: bold">
                        Filmax xin trân trọng cảm ơn quí khách đã tin tưởng sử
                        dụng dịch vụ của chúng tôi
                    </div>
                    <div>
                        Mã QR Code của bạn:
                        <div style="width: 50%; display: flex; justify-content: center">
                            <img src="cid:unique@nodemailer.com" alt="QrCode" />
                        </div>
                    </div>
                    <p>Bạn hãy sử dụng mã QR code để check in vào rạp tại Filmax bạn nhé.</p>
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

module.exports = { QRMailer };
