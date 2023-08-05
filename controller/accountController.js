const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const bcrypt = require('bcrypt');
const mail = require('../middleware/SendMailer');

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
        console.log(account[0].marole);
        let data = null;
        if (account[0].marole === 2) {
            const [person] = await pool.execute(
                'SELECT * FROM person WHERE sdt = ?',
                [account[0].sdt],
            );
            const [tien] = await pool.execute(
                'SELECT vitien FROM khachhang WHERE sdt = ?',
                [account[0].sdt],
            );
            const role = { idrole: account[0].marole };
            const user = person[0];
            const vitien = tien[0].vitien;
            data = { user, role, vitien };
        } else {
            const [person] = await pool.execute(
                'SELECT * FROM person WHERE sdt = ?',
                [account[0].sdt],
            );
            const role = { idrole: account[0].marole };
            const user = person[0];
            data = { user, role };
        }
        const token = jwt.createJWT(data);

        return res.status(200).json({
            message: 'Login successful',
            token: token,
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
        console.log(email, matkhau, sdt, hoten, gioitinh, cccd);

        const [checkSDT, fields] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [sdt],
        );
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
            message: 'Đăng ký tài khoản thất bại',
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
            mail.SendMailer({ email, newPassword });
        } catch (err) {
            console.log(err);
        }
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(newPassword, salt);
        console.log(hash);
        await pool.execute('UPDATE account SET matkhau = ? WHERE email = ?', [
            hash,
            email,
        ]);
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
            [data.user.sdt],
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
            data.user.sdt,
        ]);
        return res.status(200).json({
            message: 'Đổi mật khẩu thành công',
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
