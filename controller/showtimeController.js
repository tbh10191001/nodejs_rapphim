const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getShowtimeByID = async (req, res) => {
    try {
        const { maphim } = req.body;
        const [data] = await pool.execute(
            'SELECT suatchieuphim.maphim, suatchieuphim.masuatchieu, phongchieu.maphongchieu,tinhthanh, huyen,diachi, status, tenphongchieu, thoigianbatdau, giavemacdinh  FROM suatchieuphim  INNER  JOIN  phongchieu on phongchieu.maphongchieu = suatchieuphim.maphongchieu inner join rapchieu on phongchieu.marapchieu = rapchieu.marapchieu where  suatchieuphim.maphim =?',
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

module.exports = {
    getShowtimeByID,
};
