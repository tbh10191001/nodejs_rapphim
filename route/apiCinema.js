const express = require('express');
const cinemaController = require('../controller/cinemaController');

let Route = express.Router();

Route.get('/', cinemaController.getCinema);
Route.get('/:id', cinemaController.getCinemaCity);

module.exports = Route;
