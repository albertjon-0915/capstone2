const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
	userId: { type: String, required: [true, 'User ID is required']},
	cartItems: [
		{
			productId: {type: String, required: [true, 'Product ID is required']},
			quantity: { type: Number,  default: 0},
			subtotal: { type: Number, default: 0}
		}
	],
	totalPrice: { type: Number,  default: 0},
	orderedOn: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Cart', cartSchema);