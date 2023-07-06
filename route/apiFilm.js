const express = require('express');
const filmController = require('../controller/filmController');

let Route = express.Router();

Route.get('/getfilm', filmController.getFilm);
Route.post('/updatefilm', filmController.updateFilm);
Route.post('/insertfilm', filmController.insertFilm);
Route.post('/deletefilm', filmController.deleteFilm);

module.exports = Route;
