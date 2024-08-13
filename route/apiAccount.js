const express = require('express');
const accountController = require('../controller/accountController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.post('/login', accountController.login);
Route.post('/signup', accountController.signup);
Route.post('/forgetpassword', accountController.forgetPassword);
Route.patch(
    '/changepassword',
    jwt.authenticateToken,
    authorization.isStaff && authorization.isCustomer,
    accountController.changePassword,
);
Route.delete(
    '/delete/:sdt',
    jwt.authenticateToken,
    authorization.isStaff,
    accountController.deleteAccountByStaff,
);

module.exports = Route;
