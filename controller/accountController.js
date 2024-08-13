const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const bcrypt = require('bcrypt');
const caesar = require('caesar-encrypt');
const mail = require('../middleware/SendMailer');

let login = async (req, res) => {
    try {
        const { email, matkhau } = req.body;
        if (!email || !matkhau) {
            return res.status(300).json({
                message: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
            });
        }
        const [getEmail] = await pool.execute(
            'SELECT * FROM account WHERE account.email = ?',
            [email],
        );
        if (!getEmail[0]) {
            return res.status(300).json({
                message: 'Địa chỉ email không tồn tại.',
            });
        } else {
            const [getMatkhau] = await pool.execute(
                'SELECT matkhau FROM account WHERE email = ?',
                [email],
            );
            // const compareResult = await new Promise((resolve) =>
            //     bcrypt.compare(matkhau, getMatkhau[0].matkhau, (err, res) =>
            //         resolve(res),
            //     ),
            // );
            let hash = await caesar.encrypt(matkhau, process.env.CAESAR_SHILF);

            if (hash.toString().localeCompare(getMatkhau[0].matkhau) !== 0) {
                return res.status(300).json({
                    message: 'Mật khẩu không chính xác',
                });
            }

            const [account] = await pool.execute(
                'SELECT * FROM account WHERE email = ? AND matkhau = ?',
                [email, getMatkhau[0].matkhau],
            );
            let data = null;
            if (account[0].marole === 2) {
                const [person] = await pool.execute(
                    'SELECT * FROM person WHERE sdt = ?',
                    [account[0].sdt],
                );
                const role = { idrole: account[0].marole };
                const user = person[0];
                data = { user, role, email };
            } else {
                const [person] = await pool.execute(
                    'SELECT * FROM person WHERE sdt = ?',
                    [account[0].sdt],
                );
                const role = { idrole: account[0].marole };
                const user = person[0];
                data = { user, role, email };
            }
            const token = jwt.createJWT(data);

            return res.status(200).json({
                message: 'Đăng nhập thành công',
                token: token,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Đăng nhập thất bại',
        });
    }
};

let signup = async (req, res) => {
    try {
        const { email, matkhau, sdt, hoten, gioitinh, cccd } = req.body;

        const [checkSDT, fields] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [sdt],
        );
        const [checkCCCD] = await pool.execute(
            'SELECT * FROM person WHERE cccd = ?',
            [cccd],
        );
        const [checkEmail] = await pool.execute(
            'SELECT * FROM account WHERE email = ?',
            [email],
        );
        if (checkSDT.length !== 0) {
            return res.status(300).json({
                message: 'Số điện thoại đã được sử dụng',
            });
        } else if (checkCCCD.length !== 0) {
            return res.status(300).json({
                message: 'Căn cước công dân đã được sử dụng',
            });
        } else if (checkEmail.length !== 0) {
            return res.status(300).json({
                message: 'Địa chỉ email đã đăng ký tài khoản',
            });
        } else {
            // let salt = bcrypt.genSaltSync(10);
            // let hash = bcrypt.hashSync(matkhau, salt);
            let hash = caesar.encrypt(matkhau, process.env.CAESAR_SHILF);

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
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Đăng ký tài khoản thất bại',
        });
    }
};

let deleteAccountByStaff = async (req, res) => {
    try {
        const sdt = req.params.sdt;

        await pool.execute('DELETE FROM account WHERE sdt = ?', [sdt]);
        return res.status(200).json({
            message: 'Tài khoản đã được xoá thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Xoá tài khoản thất bại',
        });
    }
};

let forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        if (!email) {
            return res.status(300).json({
                message: 'Vui lòng nhập địa chỉ email của tài khoản',
            });
        } else {
            const [checkEmail] = await pool.execute(
                'SELECT email FROM account WHERE email = ?',
                [email],
            );
            if (checkEmail.length === 0) {
                return res.status(300).json({
                    message: 'Địa chỉ email của tài khoản chưa chính xác.',
                });
            } else {
                let newPassword = Math.random().toString(36).slice(-8);
                try {
                    mail.SendMailer({ email, newPassword });
                } catch (err) {
                    console.log(err);
                }
                // let salt = bcrypt.genSaltSync(10);
                // let hash = bcrypt.hashSync(newPassword, salt);
                let hash = caesar.encrypt(
                    newPassword,
                    process.env.CAESAR_SHILF,
                );

                await pool.execute(
                    'UPDATE account SET matkhau = ? WHERE email = ?',
                    [hash, email],
                );
                return res.status(200).json({
                    message: 'Vui lòng kiểm tra email để nhận mật khẩu mới.',
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Server đang xảy ra lỗi. Vui lòng thử lại',
        });
    }
};

let changePassword = async (req, res) => {
    try {
        let { matkhau, matkhaumoi } = req.body;

        if (!matkhau || !matkhaumoi) {
            return res.status(300).json({
                message: 'Vui lòng nhập đầy đủ thông tin',
            });
        }
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);

        const [account] = await pool.execute(
            'SELECT * FROM account WHERE sdt = ?',
            [decodedToken.user.sdt],
        );
        // const compareResult = await new Promise((resolve) =>
        //     bcrypt.compare(matkhau, account[0].matkhau, (err, res) =>
        //         resolve(res),
        //     ),
        // );
        let hash = await caesar.encrypt(matkhau, process.env.CAESAR_SHILF);

        if (hash.toString().localeCompare(account[0].matkhau) !== 0) {
            return res.status(300).json({
                message: 'Mật khẩu không chính xác',
            });
        }

        // let salt = bcrypt.genSaltSync(10);
        // let hash = bcrypt.hashSync(matkhaumoi, salt);
        let newHash = await caesar.encrypt(
            matkhaumoi,
            process.env.CAESAR_SHILF,
        );

        await pool.execute('UPDATE account SET matkhau = ? WHERE sdt = ?', [
            newHash,
            decodedToken.user.sdt,
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
    deleteAccountByStaff,
};
