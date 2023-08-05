const express = require('express');
const filmController = require('../controller/filmController');

let Route = express.Router();

Route.get('/getfilm', filmController.getFilm);
Route.get('/gettypeoffilm', filmController.getTypeOfFilm);
Route.post('/getfilmbyid', filmController.getFilmByID);
Route.post('/updatefilm', filmController.updateFilm);
Route.post('/deletefilm', filmController.deleteFilm);
Route.post('/insertfilm', filmController.insertFilm);
Route.post('/getratingfilm', filmController.getRatingFilm);
Route.post('/ratingfilm', filmController.ratingFilm);
Route.post('/getratingfilmbycustomer', filmController.getRatingFilmByCustomer);

module.exports = Route;
