const express = require('express');
const filmController = require('../controller/filmController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.get('/', filmController.getFilm);
Route.get('/gettype', filmController.getTypeOfFilm);
Route.get('/type', filmController.filterFilmByType);
Route.get('/search_name', filmController.searchFilmName);
Route.get('/search_date', filmController.searchFilmDate);

Route.get('/getrating/:id', filmController.getRatingFilm);
Route.get('/:id', filmController.getFilmByID);
// staff
Route.patch(
    '/update/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    filmController.updateFilm,
);
Route.delete(
    '/delete/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    filmController.deleteFilm,
);
Route.post(
    '/add',
    jwt.authenticateToken,
    authorization.isStaff,
    filmController.insertFilm,
);
Route.post(
    '/rating',
    jwt.authenticateToken,
    authorization.isCustomer,
    filmController.ratingFilm,
);
//customer
Route.get(
    '/ratingbycustomer/:id',
    jwt.authenticateToken,
    authorization.isCustomer,
    filmController.getRatingFilmByCustomer,
);

module.exports = Route;
