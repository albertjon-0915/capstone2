const Cart = require('../models/cart.js');
const Product = require('../models/product.js');
const auth = require('../auth.js');

const { errorHandler } = auth;

module.exports.getUserCart = (req, res) => {
	Cart.findOne({userId: req.user.id})
	.then(result => {
		if(!result){
			return res.status(400).send({ERROR: 'Failled to get cart items'})
		} else {
			return res.status(200).send({cart: result});
		}

	})
	.catch(err => errorHandler(err, req, res));
}

module.exports.addToCart = async (req, res) => {
    let totalSum = 0;
    const { cartItems } = req.body;
    
    try {
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ ERROR: 'Cart items are required' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        for (let item of cartItems) {
            const product = await Product.findOne({ _id: item.productId });
            
            if (!product) {
                // Product not found
                return res.status(400).send({ ERROR: `Product with ID ${item.productId} not found` });
            }
            
            const sumOfSubtotal = parseFloat(product.price) * parseFloat(item.quantity);
            totalSum += sumOfSubtotal;
            item.subtotal = sumOfSubtotal;
        }

        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                cartItems,
                totalPrice: totalSum
            });

            const savedCart = await cart.save();
            return res.status(201).send({ message: 'Cart created successfully', cart: savedCart });
        } else {
            cart.cartItems.push(...cartItems);
            cart.totalPrice += totalSum;

            const updatedCart = await cart.save();
            return res.status(200).send({ message: 'Cart updated successfully', cart: updatedCart });
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send({ ERROR: 'Internal server error', details: err });
    }
};


module.exports.productQuantity = (req, res) => {
    const { cartItems } = req.body;

    Cart.findOne({ userId: req.user.id })
        .then(result => {
            if (!result) {
                return res.status(400).send({ error: 'Cart not found' });
            } else {
                cartItems.forEach(item => {
                    const existingProduct = result.cartItems.find(cartItem => cartItem.productId === item.productId);
                    if (existingProduct) {
                        let price = existingProduct.subtotal / existingProduct.quantity;

                        existingProduct.quantity += item.quantity;

                        let itemSubtotal = item.quantity * price;

                        existingProduct.subtotal += itemSubtotal;
                    } else {
                        return res.status(404).send({message: 'No product found'})
                    }
                });

                result.save()
                .then(updatedCart => {
                    res.status(200).send({ message: 'Cart updated successfully', cart: updatedCart });
                })
                .catch(err => errorHandler(err, req, res));
            }
        })
        .catch(err => errorHandler(err, req, res));
};


module.exports.removeFromCart = (req, res) => {
	const productId = req.params.productId;

    Cart.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { cartItems: { productId: productId } } },
        { new: true }
    )
	.then(result => {
		if(!result){
			return res.status(400).send({ERROR: 'Failled to remove cart items'})
		} else {
            result.totalPrice = result.cartItems.reduce((acc, item) => acc + item.subtotal, 0)

            result.save()
            .then(isSaved => {
                if(!isSaved){
                    return res.status(400).send({message: 'Failed to remove cart items'});
                } else {
                    return res.status(200).send({
                        message: 'Successfully remove cart items',
                        cart: isSaved
                    });
                }
            })
            .catch(err => errorHandler(err, req, res));
		}
	})
	.catch(err => errorHandler(err, req, res));
}

module.exports.clearCart = async (req, res) => {
	// Cart.findOneAndUpdate({userId: req.user.id}, {$unset: { cartItems: []}})
    Cart.findOne({userId: req.user.id})
	.then(async (result) => {
		if(!result){
			return res.status(400).send({ERROR: 'No cart/user found'})
		} else {
            if(result.cartItems.length > 0){
                Cart.updateOne({userId: result.userId}, {$unset: { cartItems: [], totalPrice: 0}})
                .then(result => {
                    if(!result){
                        return res.status(400).send({ERROR: 'Failed to clear the cart'})
                    } else {
                        return res.status(200).send({message: 'Successfully cleared the cart'})
                    }
                })
            }
            else {
                return res.status(200).send({message: 'Cart is empty'});
            }
		}
	})
	.catch(err => errorHandler(err, req, res));
}

