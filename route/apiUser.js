const express = require('express');
const userController = require('../controller/userController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.patch('/update', jwt.authenticateToken, userController.updateInfoUser);
Route.patch(
    '/update/customer',
    jwt.authenticateToken,
    authorization.isStaff,
    userController.updateInfoCustomer,
);
Route.get('/', jwt.authenticateToken, userController.getInfomation);
Route.get(
    '/customer/account',
    jwt.authenticateToken,
    authorization.isStaff,
    userController.getCustomerAccount,
);
Route.get(
    '/customer/information',
    jwt.authenticateToken,
    authorization.isStaff,
    userController.getCustomerInformation,
);
Route.get(
    '/customer/:sdt',
    jwt.authenticateToken,
    authorization.isStaff,
    userController.getInfomationByID,
);

module.exports = Route;
