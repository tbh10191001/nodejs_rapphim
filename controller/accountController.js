const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const bcrypt = require('bcrypt');
const sendMail = require('../middleware/mailer');

let login = async (req, res) => {
    try {
        const { email, matkhau } = req.body;

        if (!email || !matkhau) {
            return res.status(300).json({
                message: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
            });
        }
        const [getMatkhau] = await pool.execute(
            'SELECT matkhau FROM account WHERE email = ?',
            [email],
        );
        const compareResult = await new Promise((resolve) =>
            bcrypt.compare(matkhau, getMatkhau[0].matkhau, (err, res) =>
                resolve(res),
            ),
        );
        if (!compareResult) {
            return res.status(300).json({
                message: 'Mật khẩu không chính xác',
            });
        }

        const [account] = await pool.execute(
            'SELECT * FROM account WHERE email = ? AND matkhau = ?',
            [email, getMatkhau[0].matkhau],
        );
        const [person] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [account[0].sdt],
        );

        const token = jwt.createJWT(person[0]);

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            decoded: decoded,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Failed to login',
        });
    }
};

let signup = async (req, res) => {
    try {
        const { email, matkhau, sdt, hoten, gioitinh, cccd } = req.body;

        if (!matkhau || !sdt || !hoten || !gioitinh || !cccd || !email) {
            return res.status(300).json({
                message: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
            });
        }
        const [checkSDT, fields] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [sdt],
        );
        console.log(checkSDT.length);
        if (checkSDT.length !== 0) {
            return res.status(300).json({
                message: 'Số điện thoại đã được sử dụng',
            });
        }

        const [checkCCCD] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [cccd],
        );
        if (checkCCCD.length !== 0) {
            return res.status(300).json({
                message: 'Căn cước công dân đã được sử dụng',
            });
        }

        const [checkSDTAccount] = await pool.execute(
            'SELECT * FROM account WHERE sdt = ?',
            [sdt],
        );
        if (checkSDTAccount.length !== 0) {
            return res.status(300).json({
                message: 'Số điện thoại đã đăng ký tài khoản',
            });
        }

        const [checkEmail] = await pool.execute(
            'SELECT * FROM account WHERE email = ?',
            [email],
        );
        if (checkEmail.length !== 0) {
            return res.status(300).json({
                message: 'Địa chỉ email đã đăng ký tài khoản',
            });
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(matkhau, salt);

        await pool.execute(
            'INSERT INTO person(sdt, hoten, gioitinh, cccd) VALUES (?,?,?,?)',
            [sdt, hoten, Number(gioitinh), cccd],
        );
        await pool.execute(
            'INSERT INTO account(email, matkhau, marole, sdt) VALUES (?,?,?,?)',
            [email, hash, 2, sdt],
        );
        await pool.execute('INSERT INTO khachhang(sdt) VALUES (?)', [sdt]);
        return res.status(200).json({
            message: 'Đăng ký tài khoản thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Failed to signup',
        });
    }
};

let forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(300).json({
                message: 'Vui lòng nhập địa chỉ email của tài khoản',
            });
        }
        const [checkEmail] = await pool.execute(
            'SELECT email FROM account WHERE email = ?',
            [email],
        );
        if (checkEmail.length === 0) {
            return res.status(300).json({
                message: 'Địa chỉ email của tài khoản chưa chính xác.',
            });
        }
        let newPassword = Math.random().toString(36).slice(-8);
        try {
            sendMail.sendMail({ newPassword, email });
        } catch (err) {
            console.log(err);
        }
        return res.status(200).json({
            message: 'Gửi mail thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Quên mật khẩu thất bại',
        });
    }
};

let changePassword = async (req, res) => {
    try {
        let { token, matkhau, matkhaumoi } = req.body;

        if (jwt.decodeToken(token) === null) {
            return res.status(404).json({
                message: 'Token is disabled',
            });
        }

        if (jwt.decodeToken(token).exp < Date.now() / 1000) {
            return res.status(404).json({
                message: 'Token unqualified',
            });
        }

        const data = jwt.verifyToken(token);
        const [account] = await pool.execute(
            'SELECT * FROM account WHERE sdt = ?',
            [data.sdt],
        );
        const compareResult = await new Promise((resolve) =>
            bcrypt.compare(matkhau, account[0].matkhau, (err, res) =>
                resolve(res),
            ),
        );
        if (!compareResult) {
            return res.status(300).json({
                message: 'Mật khẩu cũ không chính xác',
            });
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(matkhaumoi, salt);

        await pool.execute('UPDATE account SET matkhau = ? WHERE sdt = ?', [
            hash,
            data.sdt,
        ]);
        return res.status(200).json({
            message: 'Đổi mật khẩu thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Đổi mật khẩu thất bại',
        });
    }
};

module.exports = {
    login,
    signup,
    forgetPassword,
    changePassword,
};
