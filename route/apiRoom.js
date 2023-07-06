const express = require('express');
const roomController = require('../controller/roomController');

let Route = express.Router();

Route.get('/getfilm', roomController.getFilm);

module.exports = Route;
