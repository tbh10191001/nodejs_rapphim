const express = require('express');
const accountController = require('../controller/accountController')

let Route = express.Router();

Route.post('/login', accountController.login)
Route.post('/signup', accountController.signup)
Route.post('/forgetpassword', accountController.forgetPassword)
Route.post('/changepassword', accountController.changePassword)


module.exports = Route;