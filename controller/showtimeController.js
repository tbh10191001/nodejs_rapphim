const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getShowtimeByID = async (req, res) => {
    try {
        const maphim = req.params.id;
        const [data] = await pool.execute(
            `SELECT suatchieuphim.maphim, suatchieuphim.masuatchieu, phongchieu.maphongchieu,tinhthanh,diachi, tenphongchieu, ngaychieu, giochieu 
            FROM suatchieuphim  INNER  JOIN  phongchieu on phongchieu.maphongchieu = suatchieuphim.maphongchieu 
            inner join rapchieu on phongchieu.marapchieu = rapchieu.marapchieu where  suatchieuphim.maphim =? and DATE(ngaychieu) > DATE(NOW())`,
            [maphim],
        );
        console.log(data);
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};

let getShowtimes = async (req, res) => {
    try {
        const [data] = await pool.execute(
            'SELECT masuatchieu, ngaychieu, giochieu, tenphim FROM suatchieuphim INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim',
        );
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};

let getShowtimeInfoByID = async (req, res) => {
    try {
        const masuatchieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT masuatchieu, phim.maphim, ngaychieu, giochieu, tenphim, suatchieuphim.maphongchieu, tenphongchieu, phongchieu.maloaiphongchieu, tenloaiphongchieu, phongchieu.marapchieu , diachi, tinhthanh FROM suatchieuphim 
            INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim 
            INNER JOIN phongchieu ON phongchieu.maphongchieu  = suatchieuphim.maphongchieu 
            INNER JOIN loaiphongchieu ON phongchieu.maloaiphongchieu = loaiphongchieu.maloaiphongchieu 
            INNER JOIN rapchieu ON rapchieu.marapchieu = phongchieu.marapchieu WHERE suatchieuphim.masuatchieu = ?`,
            [masuatchieu],
        );
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data[0],
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};

let getCinemaByDate = async (req, res) => {
    try {
        const ngaychieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT DISTINCT(CONCAT(diachi, " ", tinhthanh)) AS cinema FROM suatchieuphim 
            INNER JOIN phongchieu ON phongchieu.maphongchieu  = suatchieuphim.maphongchieu 
            INNER JOIN loaiphongchieu ON phongchieu.maloaiphongchieu = loaiphongchieu.maloaiphongchieu 
            INNER JOIN rapchieu ON rapchieu.marapchieu = phongchieu.marapchieu WHERE suatchieuphim.ngaychieu = ? GROUP BY cinema`,
            [ngaychieu],
        );
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};

let getTimeByDate = async (req, res) => {
    try {
        const ngaychieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT masuatchieu, ngaychieu, giochieu, phongchieu.marapchieu , diachi, tinhthanh FROM suatchieuphim 
            INNER JOIN phongchieu ON phongchieu.maphongchieu  = suatchieuphim.maphongchieu 
            INNER JOIN loaiphongchieu ON phongchieu.maloaiphongchieu = loaiphongchieu.maloaiphongchieu 
            INNER JOIN rapchieu ON rapchieu.marapchieu = phongchieu.marapchieu WHERE suatchieuphim.ngaychieu = ? `,
            [ngaychieu],
        );
        console.log(data);
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};
let getShowtimeDate = async (req, res) => {
    try {
        const maphim = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT DISTINCT ngaychieu FROM suatchieuphim WHERE maphim = ? and DATE(ngaychieu) > DATE(NOW())`,
            [maphim],
        );
        return res.status(200).json({
            message: 'Lấy thông tin suất chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin suất chiếu phim thất bại',
        });
    }
};
let getTimeByIDRoom = async (req, res) => {
    try {
        const maphongchieu = req.params.id;
        const [data] = await pool.execute(
            'SELECT ngaychieu, giochieu, thoiluongchieu, tenphim FROM suatchieuphim INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim WHERE maphongchieu  = ?',
            [maphongchieu],
        );
        return res.status(200).json({
            message: 'Lấy thông tin thời gian thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin thời gian thất bại',
        });
    }
};

let addShowtime = async (req, res) => {
    try {
        const { ngaychieu, giochieu, giavemacdinh, maphim, maphongchieu } =
            req.body;
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        await pool.execute(
            `INSERT INTO suatchieuphim (ngaychieu, giochieu, giavemacdinh, maphim, maphongchieu, sdt) VALUES (?, ?, ?, ?, ?)`,
            [
                ngaychieu,
                giochieu,
                giavemacdinh,
                maphim,
                maphongchieu,
                decodedToken.user.sdt,
            ],
        );
        return res.status(200).json({
            message: 'Thêm suất chiếu phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Thêm suất chiếu phim thất bại',
        });
    }
};
let staffGetShowtime = async (req, res) => {
    try {
        const maphongchieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT masuatchieu as value, ngaychieu as label FROM phongchieu 
            INNER JOIN suatchieuphim ON suatchieuphim.maphongchieu = phongchieu.maphongchieu WHERE phongchieu.maphongchieu = ?`,
            [maphongchieu],
        );
        return res.status(200).json({
            message: 'Lấy thông tin phòng chiếu phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin phòng chiếu phim thất bại',
        });
    }
};

module.exports = {
    getShowtimeByID,
    getShowtimes,
    getShowtimeInfoByID,
    getTimeByIDRoom,
    addShowtime,
    getCinemaByDate,
    getShowtimeDate,
    getTimeByDate,
    staffGetShowtime,
};
