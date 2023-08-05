const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');

let getFilm = async (req, res) => {
    try {
        const [data] = await pool.execute('SELECT * FROM phim');
        for (i of data) {
            const [data2] = await pool.execute(
                'SELECT tentheloaiphim  FROM theloaiphim inner join phimvatheloai on theloaiphim.matheloaiphim =phimvatheloai.matheloaiphim  INNER  JOIN  phim on phimvatheloai.maphim =phim.maphim where phim.maphim= ?',
                [i.maphim],
            );
            i['theloaiphim'] = data2;
        }
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

let getRatingFilm = async (req, res) => {
    try {
        const { maphim } = req.body;
        const [data] = await pool.execute(
            'SELECT * FROM rating WHERE maphim = ?',
            [maphim],
        );

        return res.status(200).json({
            message: 'Lấy thông tin rating phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin rating phim thất bại',
        });
    }
};

let getRatingFilmByCustomer = async (req, res) => {
    try {
        const { maphim, token } = req.body;
        if (jwt.decodeToken(token) === null) {
            return res.status(404).json({
                message: 'Token is disabled',
            });
        }

        if (jwt.decodeToken(token).exp < Date.now() / 1000) {
            return res.status(404).json({
                message: 'Token hết hạn',
            });
        }
        const data = jwt.verifyToken(token);
        const [diem] = await pool.execute(
            'SELECT diem FROM rating WHERE maphim = ? AND sdt = ?',
            [maphim, data.user.sdt],
        );
        if (diem.length !== 0) {
            return res.status(200).json({
                message: 'Lấy thông tin điểm rating phim thành công',
                data: diem[0],
            });
        } else {
            return res.status(200).json({
                message: 'Lấy thông tin điểm rating phim thành công',
                data: { diem: 0 },
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin điểm rating phim thất bại',
        });
    }
};

let ratingFilm = async (req, res) => {
    try {
        const { token, maphim, diem } = req.body;
        console.log(token, maphim, diem);
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
        const [checkRating] = await pool.execute(
            'SELECT * FROM rating WHERE maphim = ? AND  sdt = ?',
            [maphim, data.user.sdt],
        );

        if (checkRating === 0) {
            await pool.execute(
                'INSERT INTO rating(diem, maphim, sdt) VALUES (?, ?, ?)',
                [diem, maphim, data.user.sdt],
            );
        } else {
            await pool.execute(
                'UPDATE rating SET diem = ? WHERE maphim = ? AND  sdt = ?',
                [diem, maphim, data.user.sdt],
            );
        }

        return res.status(200).json({
            message: 'Rating phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Rating phim thất bại',
        });
    }
};

let getFilmByID = async (req, res) => {
    try {
        const { maphim } = req.body;
        const [data] = await pool.execute(
            'SELECT * FROM phim WHERE maphim = ?',
            [maphim],
        );
        for (i of data) {
            const [theloaiphim] = await pool.execute(
                'SELECT phimvatheloai.matheloaiphim, tentheloaiphim  FROM theloaiphim inner join phimvatheloai on theloaiphim.matheloaiphim =phimvatheloai.matheloaiphim  INNER  JOIN  phim on phimvatheloai.maphim =phim.maphim where phim.maphim= ?',
                [i.maphim],
            );
            i['theloaiphim'] = theloaiphim;
        }
        return res.status(200).json({
            message: 'Lấy thông tin phim thành công',
            data: data[0],
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
            thoiluongchieu,
            ngaybatdauchieu,
            ngonngu,
            daodien,
            dienvien,
            mota,
            anhtitle,
            dotuoixem,
            trailer,
            theloaiphim,
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
            'INSERT INTO phim (tenphim,thoiluongchieu,ngaybatdauchieu,ngonngu,daodien,dienvien,mota,anhtitle,dotuoixem,sdt,trailer) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [
                tenphim,
                thoiluongchieu,
                ngaybatdauchieu,
                ngonngu,
                daodien,
                dienvien,
                mota,
                anhtitle,
                dotuoixem,
                data.user.sdt,
                trailer,
            ],
        );

        const [getIDFilm] = await pool.execute(
            'SELECT maphim  FROM phim WHERE tenphim  = ?',
            [tenphim],
        );

        for (let i in theloaiphim) {
            await pool.execute(
                'INSERT INTO phimvatheloai (matheloaiphim, maphim) VALUES (?,?)',
                [theloaiphim[i].matheloaiphim, getIDFilm[0].maphim],
            );
        }

        return res.status(200).json({
            message: 'Thêm phim thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Thêm phim thất bại',
        });
    }
};

let updateFilm = async (req, res) => {
    try {
        const {
            token,
            maphim,
            tenphim,
            thoiluongchieu,
            ngaybatdauchieu,
            ngonngu,
            daodien,
            dienvien,
            mota,
            anhtitle,
            dotuoixem,
            trailer,
            theloaiphim,
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
            'UPDATE phim SET tenphim = ?, thoiluongchieu = ?, ngaybatdauchieu = ?, ngonngu = ?, daodien = ?, dienvien = ?, mota = ?, anhtitle = ?, dotuoixem = ?, sdt = ?, trailer = ? WHERE maphim = ?',
            [
                tenphim,
                thoiluongchieu,
                ngaybatdauchieu,
                ngonngu,
                daodien,
                dienvien,
                mota,
                anhtitle,
                dotuoixem,
                data.user.sdt,
                trailer,
                maphim,
            ],
        );
        for (let i in theloaiphim) {
            await pool.execute(
                'UPDATE phimvatheloai SET matheloaiphim = ? WHERE maphim = ?',
                [theloaiphim[i].matheloaiphim, maphim],
            );
        }

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

        const [checkSuatchieu] = await pool.execute(
            'SELECT thoigianbatdau FROM suatchieuphim INNER JOIN phim ON suatchieuphim.maphim = phim.maphim WHERE phim.maphim = ?',
            [maphim],
        );

        if (checkSuatchieu.length !== 0) {
            return res.status(500).json({
                message: 'Phim đã có suất chiếu phim, nên không thể xoá',
            });
        }

        await pool.execute('DELETE FROM phimvatheloai WHERE maphim = ?', [
            maphim,
        ]);
        await pool.execute('DELETE FROM phim WHERE maphim = ?', [maphim]);

        return res.status(200).json({
            message: 'Xoá phim thành công.',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Xoá phim thất bại',
        });
    }
};

let getTypeOfFilm = async (req, res) => {
    try {
        const [data] = await pool.execute('SELECT * FROM theloaiphim');

        return res.status(200).json({
            message: 'Lấy thông tin thể loại phim thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin thể loại phim thất bại',
        });
    }
};

module.exports = {
    getFilm,
    getTypeOfFilm,
    getRatingFilm,
    getFilmByID,
    insertFilm,
    updateFilm,
    deleteFilm,
    ratingFilm,
    getRatingFilmByCustomer,
};
