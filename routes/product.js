const Product = require('../controllers/product.js');
const express = require('express');
const router = express.Router();
const auth = require('../auth.js');

const {verify, verifyAdmin} = auth;

router.post('/', verify, verifyAdmin, Product.createProduct);
router.get('/all', verify, verifyAdmin, Product.getAllProduct);
router.get('/active', Product.getAllActiveProduct);
router.get('/:productId', Product.getProduct);
router.patch('/:productId/update', verify, verifyAdmin, Product.updateProduct);
router.patch('/:productId/archive', verify, verifyAdmin, Product.archiveProduct);
router.patch('/:productId/activate', verify, verifyAdmin, Product.activateProduct);


router.post('/products/search-by-name', Product.searchProduct);
router.post('/products/search-by-price', Product.searchByPrice);

module.exports = router;