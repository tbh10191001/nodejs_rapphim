const express = require('express');
const userController = require('../controller/userController')

let Route = express.Router();

Route.post('/updateInfo', userController.updateInfoUser)
// Route.post('/signup', accountController.signup)
// Route.post('/forgetpassword', accountController.forgetPassword)
// Route.post('/changepassword', accountController.changePassword)


module.exports = Route;