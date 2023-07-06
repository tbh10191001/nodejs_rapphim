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

const authenticateToken = (req, res, nex) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) {
        return res.status(404).json({
            message: 'Token không tồn tại',
        });
    }
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

module.exports = { createJWT, verifyToken, decodeToken };
