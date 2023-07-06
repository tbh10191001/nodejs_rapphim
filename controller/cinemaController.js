const pool = require('../config/database');
const jwt = require('../middleware/JWTacction')

let getCinema = async (req, res) => {
    try {
        const [data] = await pool.execute("SELECT * FROM rapchieu")
        return res.status(200).json({
            message: 'Lấy thông tin rạp chiếu phim thành công',
            data: data
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin rạp chiếu phim thất bại'
        })
    }
}

let getFilterSameCity = async (req, res) => {
    try {
        const { tinhthanh } = req.body
        const [data] = await pool.execute("SELECT * FROM rapchieu WHERE tinhthanh = ?", [tinhthanh])
        return res.status(200).json({
            message: 'Lấy thông tin rạp chiếu phim thành công',
            data: data
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin rạp chiếu phim thất bại'
        })
    }
}


module.exports = {
    getCinema,
    getFilterSameCity
}