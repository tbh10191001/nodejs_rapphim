const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getSeatByIDRoom = async (req, res) => {
    try {
        const { maphongchieu } = req.body;
        const [data] = await pool.execute(
            'SELECT ghe.maghe,  ghe.maloaighe,status, tenloaighe, giabonus FROM ghe INNER JOIN loaighe on ghe.maloaighe = loaighe.maloaighe  WHERE maphongchieu = ?',
            [maphongchieu],
        );
        return res.status(200).json({
            message: 'Lấy thông tin ghế thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin ghế thất bại',
        });
    }
};

module.exports = { getSeatByIDRoom };
