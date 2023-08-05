const express = require('express');
const showtimeController = require('../controller/showtimeController');

let Route = express.Router();

Route.post('/getshowtimebyid', showtimeController.getShowtimeByID);

module.exports = Route;
