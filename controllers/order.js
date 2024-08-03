const Order = require('../models/order.js');
const Cart = require('../models/cart.js');
const auth = require('../auth.js');

const { errorHandler } = auth;

module.exports.createOrder = (req, res) => {
	Cart.findOne({userId: req.user.id})
	.then(async (result) => {
		if(!result){
			return res.status(400).send({
				ERROR: 'No cart found'
			})
		} else {
			const isCartNotEmpty = await result.cartItems.some(items => items !== null)
			if(isCartNotEmpty){
				let totalPrice = 0;
				result.cartItems.forEach(items => {
					totalPrice += items.subtotal;
				})

				const order = new Order ({
				    userId: result.userId,
                    productsOrdered: result.cartItems,
                    totalPrice: totalPrice
				})

				order.save()
				.then(result => {
					if(!result){
						return res.status(400).send({ERROR: 'Failed to create order'})
					} else {
						return res.status(200).send({
							message: 'Successfully checkout order',
							result
						});
					}
				})
				.catch(err => errorHandler(err, req, res));
			} else {
				return res.status(404).send({
					message: 'No items on cart'
				})
			}
		}
	})
}

module.exports.myOrder = (req, res) => {
	Order.findOne({userId: req.user.id})
	.then(result => {
		if(!result){
			return res.status(404).send({message: 'No orders found'});
		} else {
			return res.status(200).send(result);
		}
	})
	.catch(err => errorHandler(err, req, res));
}

module.exports.getAllOrder = (req, res) => {
	Order.find({})
	.then(result => {
		if(!result){
			return res.status(404).send({ERROR: 'Failed to get all orders'});
		} else {
			return res.status(200).send(result);
		}
	})
	.catch(err => errorHandler(err, req, res));
}