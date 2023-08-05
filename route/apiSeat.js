const express = require('express');
const seatController = require('../controller/seatController');

let Route = express.Router();

Route.post('/getseatbyidroom', seatController.getSeatByIDRoom);

module.exports = Route;
