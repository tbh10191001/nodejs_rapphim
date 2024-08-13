const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const moment = require('moment');
const qrcode = require('../middleware/QRcodeMailer');
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const qs = require('qs');

let getListTickets = async (req, res) => {
    try {
        const masuatchieu = req.params.id;

        const [data] = await pool.execute(
            `SELECT maghe, trangthaive, trangthaivaorap FROM ve WHERE masuatchieu = ? AND trangthaive = '1'`,
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

let deleteTicket = async (req, res) => {
    try {
        const mave = req.params.id;

        await pool.execute('UPDATE ve SET trangthaive = ? WHERE mave = ?', [
            2,
            mave,
        ]);
        // await pool.execute('UPDATE khachhang SET vitien = ? WHERE sdt = ?', [
        //     giatongcong,
        //     data.user.sdt,
        // ]);
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
let cancelTicketByStaff = async (req, res) => {
    try {
        const { mave, giatongcong, sdtkhachhang } = req.body;

        await pool.execute('UPDATE ve SET trangthaive = ? WHERE mave = ?', [
            2,
            mave,
        ]);
        await pool.execute('UPDATE khachhang SET vitien = ? WHERE sdt = ?', [
            giatongcong,
            sdtkhachhang,
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

let getTickets = async (req, res) => {
    try {
        const [data] = await pool.execute(
            'SELECT tenphim, ngaybatdauchieu, mave, trangthaive FROM ve INNER JOIN suatchieuphim ON suatchieuphim.masuatchieu  = ve.masuatchieu INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim ',
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

let getTicketsByID = async (req, res) => {
    try {
        const mave = req.params.id;
        const [data] = await pool.execute(
            'SELECT mave, trangthaive, ghe.maghe, ve.tenghe, ve.sdt as "sdtkhachhang", account.email, suatchieuphim.sdt as "sdtnhanvien", tenloaighe, thoigianthanhtoan, giatongcong, thoiluongchieu, trangthaivaorap, dotuoixem, ngonngu, thoigianbatdau, ve.masuatchieu,  suatchieuphim.maphim, tenphim FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu INNER JOIN phim on suatchieuphim.maphim = phim.maphim INNER JOIN ghe on ve.maghe = ghe.maghe INNER JOIN loaighe on loaighe.maloaighe = ghe.maloaighe INNER JOIN account on account.sdt = ve.sdt WHERE ve.mave = ?',
            [mave],
        );
        return res.status(200).json({
            message: 'Lấy thông tin vé thành công',
            data: data[0],
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin vé thất bại',
        });
    }
};

// let getTicketsInfoByID = async (req, res) => {
//     try {
//         const { mave } = req.body;
//         console.log(mave);

//         const [data] = await pool.execute(
//             'SELECT mave, trangthaive, ghe.maghe, ve.tenghe, ve.sdt as "sdtkhachhang", account.email, suatchieuphim.sdt as "sdtnhanvien", tenloaighe, thoigianthanhtoan, giatongcong, thoiluongchieu, trangthaivaorap, dotuoixem, ngonngu, thoigianbatdau, ve.masuatchieu,  suatchieuphim.maphim, tenphim FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu INNER JOIN phim on suatchieuphim.maphim = phim.maphim INNER JOIN ghe on ve.maghe = ghe.maghe INNER JOIN loaighe on loaighe.maloaighe = ghe.maloaighe INNER JOIN account on account.sdt = ve.sdt WHERE ve.mave = ?',
//             [mave],
//         );
//         return res.status(200).json({
//             message: 'Lấy thông tin vé thành công',
//             data: data[0],
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             message: 'Lấy thông tin vé thất bại',
//         });
//     }
// };
let acceptedTicket = async (req, res) => {
    try {
        const { token, mave, email } = req.body;
        const info = `http://localhost:3000/checkticket/${JSON.stringify(
            mave,
        )}`;
        try {
            qrcode.QRMailer({ email, info });
        } catch (error) {
            console.log(error);
        }

        await pool.execute('UPDATE ve SET trangthaive = ? WHERE mave = ?', [
            1,
            mave,
        ]);

        return res.status(200).json({
            message: 'Xác nhận thông tin vé thành công',
            // data: data[0],
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin vé thất bại',
        });
    }
};

let checkinTicket = async (req, res) => {
    try {
        const mave = req.params.id;

        await pool.execute(
            'UPDATE ve SET trangthaivaorap = ?, trangthaive = ? WHERE mave = ?',
            [1, 2, mave],
        );

        return res.status(200).json({
            message: 'Check in thông tin vé thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Check in thông tin vé thất bại',
        });
    }
};

let getTicketsCustomer = async (req, res) => {
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        const [tickets] = await pool.execute(
            'SELECT mave, trangthaive, trangthaivaorap, thoigianbatdau, ve.masuatchieu,  suatchieuphim.maphim, tenphim FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu INNER JOIN phim on suatchieuphim.maphim = phim.maphim WHERE ve.sdt = ?',
            [decodedToken.user.sdt],
        );
        return res.status(200).json({
            message: 'Lấy danh sách vé thành công',
            ve: tickets,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy danh sách vé thất bại',
        });
    }
};

module.exports = {
    getTickets,
    getTicketsByID,
    getTicketsCustomer,
    // getTicketsInfoByID,
    getListTickets,
    deleteTicket,
    cancelTicketByStaff,
    acceptedTicket,
    checkinTicket,
};
