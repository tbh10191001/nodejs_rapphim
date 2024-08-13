const pool = require('../config/database');
const jwt = require('../middleware/JWTacction');
const bcrypt = require('bcrypt');

let updateInfoUser = async (req, res) => {
    try {
        const params = req.body;
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        if (params.cccd) {
            const [checkCCCD] = await pool.execute(
                'SELECT cccd FROM person WHERE cccd = ?',
                [params.cccd],
            );
            if (checkCCCD.length !== 0) {
                return res.status(300).json({
                    message: 'Căn cước công dân đã được sử dụng',
                });
            }
        }

        let queryUser = `UPDATE person SET `;
        for (const [key, value] of Object.entries(params)) {
            if ((key && value) || (key && value === 0)) {
                if (key.localeCompare('gioitinh') === 0) {
                    queryUser += `${key} = ${value}, `;
                } else {
                    queryUser += `${key} = '${value}', `;
                }
            }
        }
        if (queryUser.endsWith(', ')) {
            queryUser = queryUser.slice(0, queryUser.length - 2);
        }
        queryUser += ` WHERE sdt = ${decodedToken.user.sdt}`;

        await pool.execute(queryUser);
        const [person] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [decodedToken.user.sdt],
        );
        const role = decodedToken.role;
        const user = person[0];
        const data = { user, role, email: decodedToken.email };
        return res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Cập nhật thông tin người dùng thất bại',
        });
    }
};

let updateInfoCustomer = async (req, res) => {
    try {
        const params = req.body;
        if (params.cccd) {
            const [checkCCCD] = await pool.execute(
                'SELECT cccd FROM person WHERE cccd = ?',
                [params.cccd],
            );
            if (checkCCCD.length !== 0) {
                return res.status(300).json({
                    message: 'Căn cước công dân đã được sử dụng',
                });
            }
        }

        let queryUser = `UPDATE person SET `;
        for (const [key, value] of Object.entries(params)) {
            if ((key && value) || (key && value === 0)) {
                if (key.localeCompare('gioitinh') === 0) {
                    queryUser += `${key} = ${value}, `;
                } else {
                    queryUser += `${key} = '${value}', `;
                }
            }
        }
        if (queryUser.endsWith(', ')) {
            queryUser = queryUser.slice(0, queryUser.length - 2);
        }
        queryUser += ` WHERE sdt = ${params.sdt}`;

        await pool.execute(queryUser);
        const [person] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [params.sdt],
        );
        const role = params.role;
        const user = person[0];
        const data = { user, role, email: params.email };
        return res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Cập nhật thông tin người dùng thất bại',
        });
    }
};

let getInfomation = async (req, res) => {
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        console.log(decodedToken);

        const [person] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [decodedToken.user.sdt],
        );
        const role = decodedToken.role;
        const user = person[0];
        const data = { user, role, email: decodedToken.email };
        console.log('data', data);
        return res.status(200).json({
            message: 'Lấy thông tin người dùng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin người dùng thất bại',
        });
    }
};

let getCustomerAccount = async (req, res) => {
    try {
        const [data] = await pool.execute(
            "SELECT email, matkhau, account.sdt, hoten FROM account INNER JOIN `role` ON account.marole = `role`.marole INNER JOIN person ON account.sdt = person.sdt WHERE account.marole ='2'",
        );
        return res.status(200).json({
            message: 'Lấy danh sách tài khoản khách hàng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy danh sách tài khoản khách hàng thất bại',
        });
    }
};

let getCustomerInformation = async (req, res) => {
    try {
        const [data] = await pool.execute(
            "SELECT email, account.sdt, hoten, gioitinh, cccd FROM person INNER JOIN account ON person.sdt = account.sdt INNER JOIN `role` ON `role`.marole = account.marole WHERE account.marole ='2'",
        );
        return res.status(200).json({
            message: 'Lấy danh sách thông tin khách hàng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy anh sách thông tin khách hàng thất bại',
        });
    }
};

let getInfomationByID = async (req, res) => {
    try {
        const sdt = req.params.sdt;

        const [person] = await pool.execute(
            'SELECT * FROM person WHERE sdt = ?',
            [sdt],
        );
        const [account] = await pool.execute(
            'SELECT marole, email FROM account WHERE sdt = ?',
            [sdt],
        );
        // const role = decodedToken.role;
        const user = person[0];
        const data = {
            user,
            role: { idrole: account[0].marole },
            email: account[0].email,
        };
        return res.status(200).json({
            message: 'Lấy thông tin người dùng thành công',
            data: data,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Lấy thông tin người dùng thất bại',
        });
    }
};

module.exports = {
    updateInfoUser,
    updateInfoCustomer,
    getInfomation,
    getCustomerAccount,
    getCustomerInformation,
    getInfomationByID,
};
