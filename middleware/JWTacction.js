const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
require('dotenv').config();

const createJWT = (data) => {
    let payload = data;
    let secretKey = process.env.JWT_SECRET;
    let token = null;

    try {
        token = jwt.sign(payload, secretKey, {
            expiresIn: '24h',
        });
    } catch (err) {
        console.log(err);
    }
    return token;
};
const verifyToken = (token) => {
    let secretKey = process.env.JWT_SECRET;
    let data = null;
    try {
        let decoded = jwt.verify(token, secretKey);
        data = decoded;
    } catch (err) {
        console.log(err);
    }
    return data;
};

const authenticateToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(404).json({
            message: 'Vui lòng đăng nhập để thực hiện chức năng.',
        });
    }
    const bearerToken = req.headers.authorization.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            const message =
                err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return res.status(404).json({
                message: message,
            });
        }
        req.payload = payload;
        next();
    });
};

const decodeToken = (token) => {
    let decoded = null;
    try {
        const decodedToken = jwtDecode(token);
        decoded = decodedToken;
    } catch (err) {
        console.log(err);
    }
    return decoded;
};

module.exports = { createJWT, verifyToken, decodeToken, authenticateToken };
