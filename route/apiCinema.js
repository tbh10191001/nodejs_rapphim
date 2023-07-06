const express = require('express');
const cinemaController = require('../controller/cinemaController');

let Route = express.Router();

Route.get('/getcinema', cinemaController.getCinema);
Route.post('/getfiltersamecinema', cinemaController.getFilterSameCity);
// Route.post('/forgetpassword', accountController.forgetPassword)
// Route.post('/changepassword', accountController.changePassword)

module.exports = Route;
