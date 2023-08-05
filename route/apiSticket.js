const express = require('express');
const sticketController = require('../controller/sticketController');

let Route = express.Router();

Route.post('/buysticket', sticketController.buySticket);
Route.post('/getliststickets', sticketController.getListStickets);
Route.post('/getinfoticket', sticketController.getInfoTicket);
Route.post('/deleteticket', sticketController.deleteTicket);

module.exports = Route;
