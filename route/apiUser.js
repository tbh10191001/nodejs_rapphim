const express = require('express');
const userController = require('../controller/userController');

let Route = express.Router();

Route.post('/updateinfo', userController.updateInfoUser);
Route.post('/refillwallet', userController.refillWallet);
Route.post('/getstikcetsbytoken', userController.getSticketsByToken);

// Route.post('/forgetpassword', accountController.forgetPassword)
// Route.post('/changepassword', accountController.changePassword)

module.exports = Route;
