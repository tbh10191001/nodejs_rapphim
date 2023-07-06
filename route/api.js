const express = require('express');
const routeAccount = require('./apiAccount');
const routeUser = require('./apiUser');
const routeCinema = require('./apiCinema');
const routeFilm = require('./apiFilm');

let route = express.Router();

const initRoute = (app) => {
    app.use('/api/account', routeAccount);
    app.use('/api/user', routeUser);
    app.use('/api/cinema', routeCinema);
    app.use('/api/film', routeFilm);
};

module.exports = initRoute;
