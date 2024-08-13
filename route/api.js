const express = require('express');
const routeAccount = require('./apiAccount');
const routeUser = require('./apiUser');
const routeCinema = require('./apiCinema');
const routeFilm = require('./apiFilm');
const routeShowtime = require('./apiShowtime');
const routeSeat = require('./apiSeat');
const routeSticket = require('./apiTicket');
const routeRoom = require('./apiRoom');
const routeOrder = require('./apiOrder');
const routeType = require('./apiType');

let route = express.Router();

const initRoute = (app) => {
    app.use('/api/account', routeAccount);
    app.use('/api/user', routeUser);
    app.use('/api/cinema', routeCinema);
    app.use('/api/film', routeFilm);
    app.use('/api/showtime', routeShowtime);
    app.use('/api/seat', routeSeat);
    app.use('/api/ticket', routeSticket);
    app.use('/api/room', routeRoom);
    app.use('/api/order', routeOrder);
    app.use('/api/type', routeType);
};

module.exports = initRoute;
