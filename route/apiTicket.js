const express = require('express');
const ticketController = require('../controller/ticketController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();
//staff
Route.get('/:id', ticketController.getListTickets);
Route.get('/close', (req, res) => {
    res.send('<script>window.close();</script >');
});

Route.delete(
    '/delete/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    ticketController.deleteTicket,
);
Route.get(
    '/',
    jwt.authenticateToken,
    authorization.isStaff,
    ticketController.getTickets,
);
Route.get(
    '/info/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    ticketController.getTicketsByID,
);
Route.post('/accetped', ticketController.acceptedTicket);
Route.patch(
    '/checkin/:id',
    jwt.authenticateToken,
    authorization.isStaff,
    ticketController.checkinTicket,
);
Route.patch('/cancel/:id', ticketController.cancelTicketByStaff);

//customer
Route.get(
    '/customer',
    jwt.authenticateToken,
    authorization.isCustomer,
    ticketController.getTicketsCustomer,
);

// Route.post('/getticketinfobyid', ticketController.getTicketsInfoByID);

module.exports = Route;
