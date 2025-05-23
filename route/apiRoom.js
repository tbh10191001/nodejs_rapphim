const express = require('express');
const roomController = require('../controller/roomController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.get('/:id', roomController.getRoomByCinema);
Route.get(
    '/staff/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    roomController.staffGetRoom,
);
Route.get(
    '/statistical/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    roomController.statisticalTicketByRoom,
);

module.exports = Route;
