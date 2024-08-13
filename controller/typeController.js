const pool = require('../config/database');

let statisticalTicketByType = async (req, res) => {
    try {
        const matheloaiphim = req.params.id;
        const [data] = await pool.execute(
            `
            SELECT COUNT(ve.masuatchieu) as soluongve
            FROM ve INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu 
            INNER JOIN phim ON phim.maphim = suatchieuphim.maphim 
            INNER JOIN phimvatheloai ON phimvatheloai.maphim = phim.maphim 
            INNER JOIN theloaiphim ON theloaiphim.matheloaiphim = phimvatheloai.matheloaiphim 
            WHERE theloaiphim.matheloaiphim = ? GROUP BY ve.masuatchieu`,
            [matheloaiphim],
        );
        const sum = data.reduce((a, b) => a + b.soluongve, 0);
        return res.status(200).json({
            message: 'Lấy số lượng vé theo thể loại thành công',
            data: sum,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy số lượng vé theo thể loại thất bại',
        });
    }
};
module.exports = { statisticalTicketByType };
