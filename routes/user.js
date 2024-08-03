	const User = require('../controllers/user.js');
	const express = require('express');
	const router = express.Router();
	const passport = require('passport');
	const auth = require('../auth.js');

	const {verify, verifyAdmin, errorHandler, isLoggedIn} = auth;

	router.post('/register', User.userRegister);
	router.post('/login', User.userLogin);
	router.get('/details',verify, User.userDetails);
	router.patch('/:id/set-as-admin',verify, verifyAdmin, User.updateUserAsAdmin);
	router.patch('/update-password',verify, User.updatePassword);


	// Google Login
	router.get('/google',
		passport.authenticate('google', {
			scope:['email', 'profile'],
			prompt: "select_account"
		})
	);

	router.get('/google/callback',
		passport.authenticate('google', {
			failureRedirect: '/users/failed',
		}),
		function(req, res) {
			res.redirect('/users/success');
		}
	);

	router.get('/failed', (req, res) => {
		console.log('User is not authenticated');
		res.send("Failed");
	});

	router.get('/success', isLoggedIn, (req, res) => {
		console.log('You are logged in');
		console.log(req.user);
		res.send(`Welcome ${req.user.displayName}`);
	});

	router.get('/logout', (req, res) => {
		req.session.destroy( (err) => {
			if(err){
				console.log('Error while destroying session:', err);
			} else {
				req.logout(() => {
					console.log('Your are logged out');
					res.redirect('/');
				});
			}
		});
	});


	module.exports = router;