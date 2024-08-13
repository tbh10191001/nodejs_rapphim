const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getRoomByCinema = async (req, res) => {
    try {
        const marapchieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT maphongchieu, tenphongchieu, soluongghe, phongchieu.maloaiphongchieu, tenloaiphongchieu FROM phongchieu INNER JOIN loaiphongchieu ON phongchieu.maloaiphongchieu = loaiphongchieu.maloaiphongchieu 
            INNER JOIN rapchieu ON phongchieu.marapchieu = rapchieu.marapchieu WHERE rapchieu.marapchieu = ? `,
            [marapchieu],
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

let staffGetRoom = async (req, res) => {
    try {
        const marapchieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT phongchieu.maphongchieu as value, tenphongchieu as label FROM phongchieu 
            INNER JOIN rapchieu ON phongchieu.marapchieu = rapchieu.marapchieu WHERE rapchieu.marapchieu = ? `,
            [marapchieu],
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

let statisticalTicketByRoom = async (req, res) => {
    try {
        const maphongchieu = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT COUNT(ve.masuatchieu) as soluongve, suatchieuphim.ngaychieu 
            FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu 
            INNER JOIN phongchieu ON suatchieuphim.maphongchieu = phongchieu.maphongchieu 
            WHERE phongchieu.maphongchieu = ? GROUP BY ve.masuatchieu, suatchieuphim.ngaychieu`,
            [maphongchieu],
        );
        return res.status(200).json({
            message: 'Lấy số lượng vé theo phòng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy số lượng vé theo phòng thất bại',
        });
    }
};

module.exports = { getRoomByCinema, staffGetRoom, statisticalTicketByRoom };
