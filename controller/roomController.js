const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getRoom = async (req, res) => {
    try {
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Xoá phim thất bại',
        });
    }
};

module.exports = {};
