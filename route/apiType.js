const express = require('express');
const typeController = require('../controller/typeController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.get(
    '/statistical/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    typeController.statisticalTicketByType,
);

module.exports = Route;
