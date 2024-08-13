const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const axios = require('axios');

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
        const maphim = req.params.id;
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
        const maphim = req.params.id;
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);

        const [diem] = await pool.execute(
            'SELECT diem FROM rating WHERE maphim = ? AND sdt = ?',
            [maphim, bearerToken.user.sdt],
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
        const { maphim, diem } = req.body;
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);

        const [isViewed] = await pool.execute(
            `SELECT ve.masuatchieu FROM suatchieuphim 
            INNER JOIN ve ON ve.masuatchieu = suatchieuphim.masuatchieu 
            INNER JOIN phim ON phim.maphim = suatchieuphim.maphim WHERE ve.sdt = ? AND phim.maphim = ?`,
            [decodedToken.user.sdt, maphim],
        );
        if (!isViewed) {
            return res.status(404).json({
                message: 'Bạn chưa xem bộ phim này, nên không thể đánh giá.',
            });
        } else {
            const [checkRating] = await pool.execute(
                'SELECT * FROM rating WHERE maphim = ? AND  sdt = ?',
                [maphim, decodedToken.user.sdt],
            );
            if (checkRating === 0) {
                await pool.execute(
                    'INSERT INTO rating(diem, maphim, sdt) VALUES (?, ?, ?)',
                    [diem, maphim, decodedToken.user.sdt],
                );
            } else {
                await pool.execute(
                    'UPDATE rating SET diem = ? WHERE maphim = ? AND  sdt = ?',
                    [diem, maphim, decodedToken.user.sdt],
                );
            }

            return res.status(200).json({
                message: 'Rating phim thành công',
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Rating phim thất bại',
        });
    }
};

////
let getFilmByID = async (req, res) => {
    try {
        const maphim = req.params.id;
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
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);

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
                decodedToken.user.sdt,
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
                [theloaiphim[i], getIDFilm[0].maphim],
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
        const maphim = req.params.id;
        const params = req.body;

        if (params.tenphim) {
            const [checkTenphim] = await pool.execute(
                'SELECT tenphim FROM phim WHERE tenphim = ?',
                [params.tenphim],
            );

            if (checkTenphim.length > 1) {
                return res.status(300).json({
                    message: 'Tên phim đã tồn tại',
                });
            }
        }
        let queryFilm = `UPDATE phim SET `;
        for (const [key, value] of Object.entries(params)) {
            if (key && value) {
                if (key === 'theloaiphim') {
                    console.log('value', value);
                    const [arr] = await pool.execute(
                        'SELECT matheloaiphim FROM phimvatheloai WHERE maphim = ?',
                        [maphim],
                    );
                    console.log('arr', arr);
                    if (arr.length > 0) {
                    }
                    // await pool.execute(
                    //     'DELETE FROM phimvatheloai WHERE maphim = ?',
                    //     [maphim],
                    // );
                    for (let i in value) {
                        console.log('value[i]', value[i]);
                        const [inserted] = await pool.execute(
                            `SELECT matheloaiphim, maphim FROM phimvatheloai WHERE matheloaiphim = ? AND maphim = ?`,
                            [value[i], maphim],
                        );
                        if (inserted.length === 0) {
                            await pool.execute(
                                'INSERT INTO phimvatheloai (matheloaiphim, maphim) VALUES (?, ?)',
                                [value[i], maphim],
                            );
                        }
                    }
                } else {
                    queryFilm += `${key} = '${value}', `;
                }
            }
        }
        if (queryFilm.endsWith(', ')) {
            queryFilm = queryFilm.slice(0, queryFilm.length - 2);
        }
        queryFilm += ` WHERE maphim = ${maphim}`;

        await pool.execute(queryFilm);
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        await pool.execute(`UPDATE phim SET sdt = ? WHERE maphim = ?`, [
            decodedToken.user.sdt,
            maphim,
        ]);

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
        const maphim = req.params.id;

        const [checkSuatchieu] = await pool.execute(
            'SELECT * FROM suatchieuphim INNER JOIN phim ON suatchieuphim.maphim = phim.maphim WHERE phim.maphim = ?',
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

let filterFilmByType = async (req, res) => {
    try {
        const types = JSON.parse(req.query.types);

        let data = [];
        for (let i in types) {
            const [film] = await pool.execute(
                'SELECT maphim FROM phimvatheloai WHERE matheloaiphim = ?',
                [types[i]],
            );
            if (data.length > 0) {
                let temp = [];
                film.forEach((item) => {
                    temp = data.filter((item1) => item1.maphim === item.maphim);
                });
                data = [...temp];
            } else {
                data = [...film];
            }
        }

        let result = [];
        if (data.length > 0) {
            for (let i in data) {
                const film = await axios.get(
                    'http://localhost:3030/api/film/' + data[i].maphim,
                );
                result.push(film.data.data);
            }
        }

        return res.status(200).json({
            message: 'Lọc phim theo thể loại thành công',
            data: result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Lọc phim theo thể loại thất bại',
        });
    }
};

let searchFilmName = async (req, res) => {
    try {
        const name = req.query.name;
        const [data] = await pool.execute(
            'SELECT maphim FROM phim WHERE tenphim LIKE ?',
            ['%' + name + '%'],
        );
        let result = [];
        if (data.length > 0) {
            for (let i in data) {
                const film = await axios.get(
                    'http://localhost:3030/api/film/' + data[i].maphim,
                );
                result.push(film.data.data);
            }
        }
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Tìm kiếm phim thất bại',
        });
    }
};

let searchFilmDate = async (req, res) => {
    try {
        const date = req.query.date;
        const [data] = await pool.execute(
            'SELECT maphim FROM phim WHERE ngaybatdauchieu LIKE ?',
            ['%' + date + '%'],
        );
        let result = [];
        if (data.length > 0) {
            for (let i in data) {
                const film = await axios.get(
                    'http://localhost:3030/api/film/' + data[i].maphim,
                );
                result.push(film.data.data);
            }
        }
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Tìm kiếm phim thất bại',
        });
    }
};

let getTypeOfFilm = async (req, res) => {
    try {
        const [data] = await pool.execute(
            'SELECT matheloaiphim as value, tentheloaiphim as label FROM theloaiphim',
        );

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
    filterFilmByType,
    searchFilmName,
    searchFilmDate,
    getTypeOfFilm,
    getRatingFilm,
    getFilmByID,
    insertFilm,
    updateFilm,
    deleteFilm,
    ratingFilm,
    getRatingFilmByCustomer,
};
