const express = require('express');
const showtimeController = require('../controller/showtimeController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.get('/:id', showtimeController.getShowtimeByID);
Route.get('/', showtimeController.getShowtimes);
Route.get('/date/:id', showtimeController.getShowtimeDate);
Route.get('/cinema/:id', showtimeController.getCinemaByDate);
Route.get('/time/:id', showtimeController.getTimeByDate);
Route.get('/info/:id', showtimeController.getShowtimeInfoByID);
Route.get('/room/:id', showtimeController.getTimeByIDRoom);
Route.get(
    '/staff/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    showtimeController.staffGetShowtime,
);

//staff
Route.post(
    '/add',
    jwt.authenticateToken,
    authorization.isStaff,
    showtimeController.addShowtime,
);

module.exports = Route;
