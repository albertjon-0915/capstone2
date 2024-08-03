const Cart = require('../controllers/cart.js');
const express = require('express');
const router = express.Router();
const auth = require('../auth.js');

const {verify, verifyAdmin} = auth;

router.get('/get-cart', verify, Cart.getUserCart);
router.post('/add-to-cart', verify, Cart.addToCart);
router.patch('/update-cart-quantity', verify, Cart.productQuantity);

router.patch('/:productId/remove-from-cart', verify, Cart.removeFromCart);
router.put('/clear-cart', verify, Cart.clearCart);


module.exports = router;