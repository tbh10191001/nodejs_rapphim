const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

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
            [hoten, Number(gioitinh), cccd, data.sdt],
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

module.exports = {
    updateInfoUser,
};
