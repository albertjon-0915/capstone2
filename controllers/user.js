const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const auth = require('../auth.js');

const { createAccessToken, errorHandler } = auth;

module.exports.userRegister = (req, res) => {

	User.findOne({email: req.body.email})
	.then(result => {
		if(result){
		res.status(409).send({error: 'Duplicate email, you are already registered'});
		} else {
			const {firstName, lastName, email, isAdmin, password, mobileNo} = req.body;

			if(!email.includes('@')){
				return res.status(400).send({message: 'Invalid email'});
			}
			else if(password.length < 8){
				return res.status(400).send({message: 'Password must be atleast 8 characters'});
			}
			else if(mobileNo.length < 11 || mobileNo.length >= 12){
				return res.status(400).send({
					text: mobileNo.length,
					text: mobileNo,
					message: 'Mobile Number is invalid, Mobile number must be 11 numbers'});
			}
			else {
				let newUser = new User({
					firstName,
					lastName,
					email,
					password: bcrypt.hashSync(password, 10),
					isAdmin,
					mobileNo
				});

				newUser.save()
				.then((result) => {
						res.status(200).send({
							message: 'User registered successfully',
							user: result
						});
					})
				.catch((err) => {
					res.status(400).send({
						message: 'Failed to register',
						error: err.message
					});	
				});
			}
		}
	})
	.catch(err => {
		res.status(400).send({
			message: 'Failed to register',
			error: err.message
		});
	});
}

module.exports.userLogin = (req, res) => {
	// const { email } = req.body;

	if(req.body.email.includes('@')){
		User.findOne({email: req.body.email})
		.then(result => {
			if(!result){
				return res.status(404).send({message: 'No email found'});
			} else {
				const { password } = req.body;

				let isPasswordCorrect = bcrypt.compareSync(password, result.password);

				if(isPasswordCorrect){
					return res.status(200).send({
						message: 'Login successfully',
						access: createAccessToken(result)
					});
				} else {
					return res.status(401).send({ message: 'Incorrect email or password' })
				}
			}

		})
		.catch(err => res.status(404).send({message: 'No email found'}));
	} else {
		return res.send({message: 'Invalid email'});
	}
}

module.exports.userDetails = (req, res) => {
	try{
		User.findById(req.user.id)
		.then(result => {
			if(!result){
				return res.status(404).send({message: 'User not found'});
			} else {
				return res.status(200).send(result);
			}
		})
		.catch(err => res.status(404).send({message: 'User not found'}));
	}
	catch(err){
		console.error(err);
		res.status(500).send({
			error: 'Internal server error',
			err
		});
	}
}

module.exports.updateUserAsAdmin = async (req, res) => {
	const {firstName, lastName, email, password, isAdmin, mobileNo} = req.body;

	const user = await User.findOne({ email });

	if(!user){
		return res.statu(404).send({message: 'No user found'});
	} else {
		let updateUser = {
			firstName, 
			lastName, 
			email, 
			password,
			isAdmin, 
			mobileNo
		}

		if(password){
			updateUser.password = bcrypt.hashSync(password, 10);
		}

		User.findByIdAndUpdate(user._id, updateUser, {new: true})
		.then(result => {
			if(!result){
				return res.status(400).send({message: 'Failed updating user'});
			} else {
				return res.status(200).send({
					message: 'User updated successfully',
					result
				});
			}
		})
		.catch(err => res.status(400).send({error: 'Failed updating user'}));
	}
}

module.exports.updatePassword = (req, res) => {
 	try{
 		const { password } = req.body;

		if(!password){
		 	return res.status(400).send({ERROR: 'Input new password'});
		}

		const newPassword = bcrypt.hashSync(password, 10);
		const { id } = req.user;
		

		User.findByIdAndUpdate(id , { password: newPassword }, { new: true })
		.then(result => {
			if(!result){
				return res.status(400).send({ERROR: 'Failed to update password', id});
			} else {
				return res.status(200).send({
					message: 'Password updated successfully',
					newPassword: result.password
				});
			}
		}). catch(err => res.status(400).send({ERROR: 'Failed to update password', req}))
 	} catch(err) {
 		return res.status(500).send('Internal server error');
 	}
}
