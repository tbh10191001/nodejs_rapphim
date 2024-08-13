const express = require('express');
const seatController = require('../controller/seatController');

let Route = express.Router();

Route.get('/:id', seatController.getSeatByIDRoom);

module.exports = Route;
