const Order = require('../controllers/order.js');
const express = require('express');
const router = express.Router();
const auth = require('../auth.js');

const {verify, verifyAdmin} = auth;

router.post('/checkout', verify, Order.createOrder)
router.get('/my-orders', verify, Order.myOrder)
router.get('/all-orders', verify, verifyAdmin, Order.getAllOrder)

module.exports = router;