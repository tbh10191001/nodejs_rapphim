const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getFilm = async (req, res) => {
    try {
        const [data] = await pool.execute('SELECT * FROM phim');
        return res.status(200).json({
            message: 'Lấy thông tin phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin phim thất bại',
        });
    }
};

let insertFilm = async (req, res) => {
    try {
        const {
            token,
            tenphim,
            thoiluongphim,
            ngaybatdauchieu,
            ngonngu,
            daodien,
            dienvien,
            mota,
            anhtitle,
            dotuoixem,
        } = req.body;
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

        const [checkTenphim] = await pool.execute(
            'SELECT tenphim FROM phim WHERE tenphim = ?',
            [tenphim],
        );

        if (checkTenphim.length !== 0) {
            return res.status(300).json({
                message: 'Tên phim đã tồn tại',
            });
        }

        await pool.execute(
            'INSERT INTO phim (tenphim,thoiluongphim,ngaybatdauchieu,ngonngu,daodien,dienvien,mota,anhtitle,dotuoixem,sdt) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [
                tenphim,
                thoiluongphim,
                Date(ngaybatdauchieu),
                ngonngu,
                daodien,
                dienvien,
                mota,
                anhtitle,
                dotuoixem,
                data.sdt,
            ],
        );

        return res.status(200).json({
            message: 'Thêm phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin phim thất bại',
        });
    }
};

let updateFilm = async (req, res) => {
    try {
        const {
            token,
            tenphim,
            thoiluongphim,
            ngaybatdauchieu,
            ngonngu,
            daodien,
            dienvien,
            mota,
            anhtitle,
            dotuoixem,
        } = req.body;

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

        const [checkTenphim] = await pool.execute(
            'SELECT tenphim FROM phim WHERE tenphim = ?',
            [tenphim],
        );

        if (checkTenphim.length !== 0) {
            return res.status(300).json({
                message: 'Tên phim đã tồn tại',
            });
        }

        await pool.execute(
            'UPDATE phim SET tenphim = ?, thoiluongphim = ?, ngaybatdauchieu = ?, ngonngu = ?, daodien = ?, dienvien = ?, mota = ?, anhtitle = ?, dotuoixem = ?, sdt = ?)',
            [
                tenphim,
                thoiluongphim,
                Date(ngaybatdauchieu),
                ngonngu,
                daodien,
                dienvien,
                mota,
                anhtitle,
                dotuoixem,
                data.sdt,
            ],
        );

        return res.status(200).json({
            message: 'Cập nhật phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Cập nhật phim thất bại',
        });
    }
};

let deleteFilm = async (req, res) => {
    try {
        const { token, maphim } = req.body;

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

        await pool.execute('DELETE FROM film WHERE maphim = ?', [maphim]);

        return res.status(200).json({
            message: 'Xoá phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Xoá phim thất bại',
        });
    }
};

module.exports = {
    getFilm,
    insertFilm,
    updateFilm,
    deleteFilm,
};
