const express = require('express');
const orderController = require('../controller/orderController');
const jwt = require('../middleware/JWTacction');
const authorization = require('../middleware/Authorzation');

let Route = express.Router();

Route.get(
    '/',
    jwt.authenticateToken,
    authorization.isCustomer,
    orderController.getOrdersBySDT,
);

Route.get(
    '/:id',
    jwt.authenticateToken,
    authorization.isCustomer,
    orderController.getOrderDetail,
);

Route.post(
    '/refund',
    jwt.authenticateToken,
    authorization.isCustomer,
    orderController.refund,
);

Route.post(
    '/refundstatus',
    jwt.authenticateToken,
    authorization.isCustomer,
    orderController.refundStatus,
);

Route.post(
    '/payment',
    jwt.authenticateToken,
    authorization.isCustomer,
    orderController.payment,
);

Route.post('/callback', orderController.paymentResult);
Route.post('/zalostatus/:app_trans_id', orderController.paymentStatus);

module.exports = Route;
