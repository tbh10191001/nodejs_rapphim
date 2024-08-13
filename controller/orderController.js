const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const moment = require('moment');
const axios = require('axios'); // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const qrcode = require('../middleware/QRcodeMailer');
const qs = require('qs');

let getOrdersBySDT = async (req, res) => {
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        const [data] = await pool.execute(
            `SELECT hoadon.mahoadon, thoigianthanhtoan, trangthaihoadon, description, giatongcong, ngaychieu, giochieu, phim.tenphim 
            FROM hoadon INNER JOIN ve ON hoadon.mahoadon = ve.mahoadon
            INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu
            INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim WHERE hoadon.sdt = ? GROUP BY ve.mave`,
            [decodedToken.user.sdt],
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

let getOrderDetail = async (req, res) => {
    try {
        const mahoadon = req.params.id;

        const [data] = await pool.execute(
            `SELECT hoadon.mahoadon, thoigianthanhtoan, trangthaihoadon, description, zpTransID, mRefundID, giatongcong, ngaychieu, giochieu, 
            phim.tenphim, phim.thoiluongchieu, phim.ngonngu, phim.dotuoixem
            FROM hoadon INNER JOIN ve ON hoadon.mahoadon = ve.mahoadon
            INNER JOIN suatchieuphim ON ve.masuatchieu = suatchieuphim.masuatchieu
            INNER JOIN phim ON phim.maphim  = suatchieuphim.maphim 
            INNER JOIN phongchieu ON phongchieu.maphongchieu  = suatchieuphim.maphongchieu 
            INNER JOIN rapchieu ON rapchieu.marapchieu = suatchieuphim.maphim WHERE hoadon.mahoadon = ?`,
            [mahoadon],
        );
        const [seats] = await pool.execute(
            `SELECT ve.tenghe, ve.trangthaivaorap, ve.trangthaive, ve.maghe, loaighe.tenloaighe, loaighe.giaghe FROM hoadon 
            INNER JOIN ve ON hoadon.mahoadon = ve.mahoadon 
            INNER JOIN ghe ON ve.maghe = ghe.maghe  
            INNER JOIN loaighe ON ghe.maloaighe = loaighe.maloaighe WHERE hoadon.mahoadon = ?`,
            [mahoadon],
        );
        return res.status(200).json({
            message: 'Lấy thông tin hoá đơn thành công',
            data: { data: data[0], seats: seats },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin hoá đơn thất bại',
        });
    }
};

let cancelOrder = async (req, res) => {
    try {
        const { mahoadon, seats, ngaychieu, giochieu } = req.body;
        console.log(mahoadon, seats, ngaychieu, giochieu);

        // await pool.execute(
        //     'UPDATE hoadon SET trangthaihoadon = 0, description = ? WHERE mahoadon = ?',
        //     ['Đã huỷ hoá đơn', mahoadon],
        // );
        return res.status(200).json({
            message: 'Huỷ hoá đơn thành công',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Huỷ hoá đơn thất bại',
        });
    }
};

let refund = async (req, res) => {
    try {
        const {
            zpTransID,
            amount,
            description,
            mahoadon,
            seats,
            ngaychieu,
            giochieu,
        } = req.body;
        if (
            !zpTransID ||
            !amount ||
            !description ||
            !mahoadon ||
            !seats ||
            !ngaychieu ||
            !giochieu
        ) {
            return res.status(500).json({
                message: 'Không có đủ thông tin để thực hiện hoàn tiền',
            });
        }
        const datetime = `${moment(ngaychieu).format(
            'YYYY-MM-DD',
        )} ${giochieu}`;
        const myDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

        if (
            Date.parse(myDate) - Date.parse(datetime) <=
            1000 * 60 * 60 * 24 * 2
        ) {
            return res.status(500).json({
                message:
                    'Không thể hoàn tiền cho vé đã xem, chỉ hoàn tiền trước 2 ngày',
            });
        }
        // const config = {
        //     app_id: '2554',
        //     key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
        //     key2: 'Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3',
        //     refund_url: 'https://sandbox.zalopay.com.vn/v001/tpe/partialrefund',
        // };

        const timestamp = Date.now();
        const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

        let params = {
            appid: process.env.ZALOPAYv1_app_id,
            mrefundid: `${moment().format('YYMMDD')}_${
                process.env.ZALOPAYv1_app_id
            }_${uid}`,
            timestamp, // miliseconds
            zptransid: zpTransID,
            amount: amount,
            description: description,
        };

        let data =
            params.appid +
            '|' +
            params.zptransid +
            '|' +
            params.amount +
            '|' +
            params.description +
            '|' +
            params.timestamp;
        params.mac = CryptoJS.HmacSHA256(
            data,
            process.env.ZALOPAYv1_key1,
        ).toString();
        try {
            const result = await axios.post(
                process.env.ZALOPAYv1_endpoint_refund,
                null,
                {
                    params,
                },
            );

            await pool.execute(
                `UPDATE hoadon SET trangthaihoadon = 2, description = ?, mRefundID = ?  WHERE mahoadon = ?`,
                ['Đang thực hiện hoàn tiền', result.data.refundid, mahoadon],
            );
            console.log(result.data);
            return res.status(200).json(result.data);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
};
let refundStatus = async (req, res) => {
    const { mrefundid, mahoadon } = req.body;
    // const config = {
    //     app_id: '2554',
    //     key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
    //     key2: 'Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3',
    //     refund_url:
    //         'https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus',
    // };
    // const config = {
    //     app_id: '2554',
    //     key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
    //     key2: 'Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3',
    //     refund_url:
    //         'https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus',
    // };

    const config = {
        app_id: '2554',
        key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
        key2: 'Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3',
        refund_url:
            'https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus',
    };
    console.log('mrefundid', mrefundid);
    console.log('mahoadon', mahoadon);

    // const params = {
    //     appid: process.env.ZALOPAYv1_app_id,
    //     timestamp: Date.now(),
    //     mrefundid: mrefundid,
    // };
    const params = {
        appid: config.app_id,
        timestamp: Date.now(),
        mrefundid: mrefundid,
    };

    // const data =
    //     process.env.ZALOPAYv1_app_id +
    //     '|' +
    //     params.mrefundid +
    //     '|' +
    //     params.timestamp; // appid|mrefundid|timestamp
    // params.mac = CryptoJS.HmacSHA256(
    //     data,
    //     process.env.ZALOPAYv1_key1,
    // ).toString();

    const data =
        config.app_id + '|' + params.mrefundid + '|' + params.timestamp; // appid|mrefundid|timestamp
    params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    console.log(params);
    console.log(data);

    try {
        const result = await axios.get(config.refund_url, { params });
        console.log(result.data);
        // if (result.data.returncode === 1) {
        //     await pool.execute(
        //         `UPDATE hoadon SET trangthaihoadon = 4, description = ? WHERE mahoadon = ?`,
        //         ['Hoàn tiền thành công', mahoadon],
        //     );
        // } else {
        //     await pool.execute(
        //         `UPDATE hoadon SET trangthaihoadon = 5, description = ? WHERE mahoadon = ?`,
        //         [result.data.returnmessage, mahoadon],
        //     );
        // }
        return res.status(200).json(result.data);
    } catch (error) {
        console.log(error);
    }
};

const config = {
    app_id: process.env.ZALOPAY_app_id,
    key1: process.env.ZALOPAY_key1,
    key2: process.env.ZALOPAY_key2,
    endpoint: process.env.ZALOPAY_endpoint_create,
};

let payment = async (req, res, next) => {
    // moi truong sandbox
    const { giatongcong, masuatchieu, list } = req.body;
    const bearerToken = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decodeToken(bearerToken);
    // check
    try {
        for (let i = 0; i < list.length; i++) {
            const [data] = await pool.execute(
                'SELECT * FROM ve WHERE masuatchieu = ? AND maghe = ? AND trangthaive = 1',
                [masuatchieu, list[i].maghe],
            );
            if (data.length !== 0) {
                return res.status(500).json({
                    message: 'Vé đã được đặt, vui lòng tải lại trang',
                });
            }
        }
        // add => return link
        const embed_data = {
            redirecturl: 'http://localhost:3000/',
        };
        const user = [
            {
                user: decodedToken.user,
                email: decodedToken.email,
                masuatchieu: masuatchieu,
                list: list,
            },
        ];
        const transID = Math.floor(Math.random() * 1000000);

        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            app_user: decodedToken.user.hoten,
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(user),
            embed_data: JSON.stringify(embed_data),
            amount: Number(giatongcong),
            description: `Thanh toán tiền vé xem phim tại rạp Filmax #${transID}`,
            bank_code: '',
            callback_url:
                'https://0fef-42-119-149-216.ngrok-free.app/api/order/callback',
        };
        try {
            await pool.execute(
                'INSERT INTO hoadon (mahoadon,sdt,trangthaihoadon,thoigianthanhtoan,giatongcong, zpTransID) VALUES (?,?,?,?,?,?)',
                [
                    order.app_trans_id,
                    decodedToken.user.sdt,
                    0,
                    moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                    order.amount,
                    '',
                ],
            );
            for (let i = 0; i < list.length; i++) {
                await pool.execute(
                    'INSERT INTO ve (masuatchieu, maghe, trangthaivaorap, trangthaive, tenghe, mahoadon) VALUES (?,?,?,?,?,?)',
                    [
                        Number(masuatchieu),
                        list[i].maghe,
                        0,
                        0,
                        list[i].index,
                        order.app_trans_id,
                    ],
                );
            }
        } catch (err) {
            console.log(err);
        }
        const data =
            config.app_id +
            '|' +
            order.app_trans_id +
            '|' +
            order.app_user +
            '|' +
            order.amount +
            '|' +
            order.app_time +
            '|' +
            order.embed_data +
            '|' +
            order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
            console.log('config.endpoint', config.endpoint);
            const result = await axios.post(config.endpoint, null, {
                params: order,
            });
            return res
                .status(200)
                .json({ ...result.data, app_trans_id: order.app_trans_id });
        } catch (error) {
            console.log('error', error);
            return res
                .status(500)
                .json({
                    message:
                        'Dịch vụ thanh toán đang có vấn đề, vui lòng thử lại sau',
                });
        }
    } catch (err) {
        console.log(err);
    }
};

let paymentResult = async (req, res) => {
    let result = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        console.log('mac =', mac);

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
            // callback không hợp lệ
            let dataJson = JSON.parse(dataStr, config.key2);

            result.return_code = -1;
            result.return_message = 'Thanh toán thất bại.';
        } else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            let dataJson = JSON.parse(dataStr, config.key2);
            const data = JSON.parse(dataJson['item']);

            try {
                await pool.execute(
                    'UPDATE hoadon SET thoigianthanhtoan = ?, trangthaihoadon = 1, description = ?, zpTransID = ? WHERE mahoadon = ?',
                    [
                        moment(dataJson['server_time']).format(
                            'YYYY-MM-DD HH:mm:ss',
                        ),
                        'Giao dịch thành công',
                        dataJson['zp_trans_id'],
                        dataJson['app_trans_id'],
                    ],
                );
                for (let i = 0; i < data[0].list.length; i++) {
                    await pool.execute(
                        'UPDATE ve SET trangthaive = 1 WHERE masuatchieu = ? AND maghe = ?',
                        [data[0].masuatchieu, data[0].list[i].maghe],
                    );
                }
                result.return_code = 1;
                result.return_message = 'Thanh toán thành công.';
            } catch (error) {
                console.log(error);
            }
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
};

let paymentStatus = async (req, res, next) => {
    const app_trans_id = req.params.app_trans_id;
    const { giatongcong, masuatchieu, list } = req.body;
    if (!giatongcong || !masuatchieu || !list) {
        return res.status(500).json({
            message: 'Không có thông tin vé',
        });
    }
    let postData = {
        app_id: process.env.ZALOPAY_app_id,
        app_trans_id: app_trans_id, // Input your app_trans_id
    };

    let data =
        postData.app_id +
        '|' +
        postData.app_trans_id +
        '|' +
        process.env.ZALOPAY_key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(
        data,
        process.env.ZALOPAY_key1,
    ).toString();

    let postConfig = {
        method: 'post',
        url: process.env.ZALOPAY_endpoint_query,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
    };

    try {
        const result = await axios(postConfig);

        try {
            if (result.data.return_code === 1) {
                await pool.execute(
                    'UPDATE hoadon SET thoigianthanhtoan = ?, trangthaihoadon = 1, description = ?, zpTransID = ? WHERE mahoadon = ?',
                    [
                        moment(result.data.server_time).format(
                            'YYYY-MM-DD HH:mm:ss',
                        ),
                        result.data.return_message,
                        result.data.zp_trans_id,
                        app_trans_id,
                    ],
                );
                for (let i = 0; i < list.length; i++) {
                    await pool.execute(
                        'UPDATE ve SET trangthaive = 1 WHERE masuatchieu = ? AND maghe = ?',
                        [masuatchieu, list[i].maghe],
                    );
                }
            }
            if (
                result.data.return_code !== 1 &&
                result.data.return_code !== 3
            ) {
                await pool.execute(
                    'UPDATE hoadon SET trangthaihoadon = 0, description = ? WHERE mahoadon = ?',
                    [result.data.return_message, app_trans_id],
                );
                for (let i = 0; i < list.length; i++) {
                    await pool.execute(
                        'UPDATE ve SET trangthaive = 0 WHERE masuatchieu = ? AND maghe = ?',
                        [masuatchieu, list[i].maghe],
                    );
                }
            }
            return res.status(200).json(result.data);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    getOrdersBySDT,
    getOrderDetail,
    cancelOrder,
    refund,
    refundStatus,
    payment,
    paymentResult,
    paymentStatus,
};
