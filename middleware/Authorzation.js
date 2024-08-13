const jwt = require('../middleware/JWTacction');

const isStaff = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = await jwt.decodeToken(bearerToken);
        if (decodedToken.role.idrole !== 1) {
            return res.status(404).json({
                message: 'You do not have permission to access this',
            });
        }
        next();
    } catch (err) {
        console.log(err);
    }
};
const isCustomer = (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decodeToken(bearerToken);
        if (decodedToken.role.idrole !== 2) {
            return res.status(404).json({
                message: 'You do not have permission to access this',
            });
        }
        next();
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    isStaff,
    isCustomer,
};
