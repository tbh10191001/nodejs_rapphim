const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const bcrypt = require('bcrypt');

let updateInfoUser = async (req, res) => {
    try {
        const { token, hoten, gioitinh, cccd } = req.body;

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
        const [checkCCCD] = await pool.execute(
            'SELECT cccd FROM person WHERE cccd = ?',
            [cccd],
        );
        if (checkCCCD.length !== 0) {
            return res.status(300).json({
                message: 'Căn cước công dân đã được sử dụng',
            });
        }
        await pool.execute(
            'UPDATE person SET hoten = ?, gioitinh = ?, cccd = ? WHERE sdt = ?',
            [hoten, Number(gioitinh), cccd, data.user.sdt],
        );
        return res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Cập nhật thông tin người dùng thất bại',
        });
    }
};

let refillWallet = async (req, res) => {
    try {
        const { token, vitien, matkhau } = req.body;

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
                message: 'Mật khẩu không chính xác',
            });
        }
        const [checkVitien] = await pool.execute(
            'SELECT vitien FROM khachhang WHERE sdt = ?',
            [data.user.sdt],
        );
        const tien =
            Number.parseFloat(checkVitien[0].vitien) +
            Number.parseFloat(vitien);
        await pool.execute('UPDATE khachhang SET vitien = ? WHERE sdt = ?', [
            Number.parseFloat(tien),
            data.user.sdt,
        ]);
        return res.status(200).json({
            message: 'Nạp tiền thành công',
            vitien: tien,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Nạp tiền thất bại',
        });
    }
};

let getSticketsByToken = async (req, res) => {
    try {
        const { token } = req.body;

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
        const [stickets] = await pool.execute(
            'SELECT mave, trangthaive, trangthaivaorap, thoigianbatdau, ve.masuatchieu,  suatchieuphim.maphim, tenphim FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu INNER JOIN phim on suatchieuphim.maphim = phim.maphim WHERE ve.sdt = ?',
            [data.user.sdt],
        );
        return res.status(200).json({
            message: 'Lấy danh sách vé thành công',
            ve: stickets,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy danh sách vé thất bại',
        });
    }
};

module.exports = {
    updateInfoUser,
    refillWallet,
    getSticketsByToken,
};
