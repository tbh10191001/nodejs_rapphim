const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const moment = require('moment');

let buySticket = async (req, res) => {
    try {
        const { token, giatongcong, masuatchieu, maghe } = req.body;
        if (jwt.decodeToken(token) === null) {
            return res.status(404).json({
                message: 'Token is disabled',
            });
        }

        if (jwt.decodeToken(token).exp < Date.now() / 1000) {
            return res.status(404).json({
                message: 'Token hết hạn',
            });
        }
        if (!giatongcong || !masuatchieu || !maghe) {
            return res.status(300).json({
                message: 'Vui lòng nhập đầy đủ thông tin mua vé',
            });
        }
        const data = jwt.verifyToken(token);
        const [checkVitien] = await pool.execute(
            'SELECT vitien FROM khachhang WHERE sdt = ?',
            [data.user.sdt],
        );
        if (checkVitien[0].vitien < giatongcong) {
            return res.status(500).json({
                message:
                    'Số tiền trong tài khoản của quý khách không đủ để thanh toán. Vui lòng nạp tiền vào tài khoản.',
            });
        }
        let datetime = moment().format('YYYY-MM-DD HH:mm:ss');
        await pool.execute(
            'INSERT INTO ve (giatongcong, masuatchieu, maghe, sdt, trangthaivaorap, trangthaive, thoigianthanhtoan) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [giatongcong, masuatchieu, maghe, data.user.sdt, 0, 0, datetime],
        );
        await pool.execute('UPDATE ghe SET status = ? WHERE maghe = ?', [
            1,
            maghe,
        ]);
        const vitien =
            Number.parseFloat(checkVitien[0].vitien) -
            Number.parseFloat(giatongcong);
        await pool.execute('UPDATE khachhang SET vitien = ? WHERE sdt = ?', [
            vitien,
            data.user.sdt,
        ]);
        return res.status(200).json({
            message: 'Mua vé thành công',
            vitien: vitien,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Mua vé thất bại',
        });
    }
};

let getListStickets = async (req, res) => {
    try {
        const { masuatchieu } = req.body;

        const [data] = await pool.execute(
            'SELECT maghe FROM ve WHERE masuatchieu = ?',
            [masuatchieu],
        );
        return res.status(200).json({
            message: 'Lấy danh sách vé thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy danh sách vé thất bại',
        });
    }
};

let getInfoTicket = async (req, res) => {
    try {
        const { mave } = req.body;

        const [data] = await pool.execute(
            'SELECT mave, trangthaive, tenloaighe, thoigianthanhtoan, giatongcong, thoiluongchieu, trangthaivaorap, dotuoixem, ngonngu, thoigianbatdau, ve.masuatchieu,  suatchieuphim.maphim, tenphim FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu INNER JOIN phim on suatchieuphim.maphim = phim.maphim INNER JOIN ghe on ve.maghe = ghe.maghe INNER JOIN loaighe on loaighe.maloaighe = ghe.maloaighe WHERE ve.mave = ?',
            [mave],
        );
        return res.status(200).json({
            message: 'Lấy thông tin vé thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin vé thất bại',
        });
    }
};

let deleteTicket = async (req, res) => {
    try {
        const { token, maghe } = req.body;
        if (jwt.decodeToken(token) === null) {
            return res.status(404).json({
                message: 'Token is disabled',
            });
        }

        if (jwt.decodeToken(token).exp < Date.now() / 1000) {
            return res.status(404).json({
                message: 'Token hết hạn',
            });
        }

        const data = jwt.verifyToken(token);
        await pool.execute('DELETE FROM ve WHERE sdt = ? AND mave = ?', [
            data.user.sdt,
            mave,
        ]);
        return res.status(200).json({
            message: 'Huỷ vé thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Huỷ vé thất bại',
        });
    }
};

module.exports = {
    buySticket,
    getListStickets,
    getInfoTicket,
    deleteTicket,
};
