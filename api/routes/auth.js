const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')
const { isAuthenticated, hasRoles } = require('../auth')
const nodemailer = require('nodemailer')

//Inicio configuracion nodemailer

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'edu4all.20@gmail.com', // generated ethereal user
      pass: 'jdypiokltmtlnxdi', // generated ethereal password
    },
});

//Fin configuracion nodemailer

const router = express.Router()

const signToken = (_id) => {
	return jwt.sign({ _id }, 'mi-secreto', {
		expiresIn: 60 * 60 * 24 * 365,
	})
}

router.post('/register', (req, res) => {
	let { email, password } = req.body
	email = email.toLowerCase()
	crypto.randomBytes(16, (err, salt) => {
		const newSalt = salt.toString('base64')
		crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
			const encryptedPassword = key.toString('base64')
			Users.findOne({ email })
				.exec()
				.then((user) => {
					if (user) {
						return res.send('Usuario ya existe')
					}
					Users.create({
						email,
						password: encryptedPassword,
						salt: newSalt,
					}).then(() => {
						res.send('Usuario creado con exito')
					})
				})
		})
	})
})

router.post('/login', (req, res) => {
	let { email, password } = req.body
	email = email.toLowerCase()
	console.log(email)
	Users.findOne({ email })
		.exec()
		.then((user) => {
			if (!user) {
				return res.send('usuario y/o contraseña incorrecta')
			}
			crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
				const encryptedPassword = key.toString('base64')
				if (user.password === encryptedPassword) {
					const token = signToken(user._id)
					return res.send({ token })
				}
				return res.send('usuario y/o contraseña incorrecta')
			})
		})
})

// Create user Admin
router.post('/register/admin', isAuthenticated, hasRoles(['admin']), (req, res) => {
	let { email, password, role } = req.body
	email = email.toLowerCase()
	crypto.randomBytes(16, (err, salt) => {
		const newSalt = salt.toString('base64')
		crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
			const encryptedPassword = key.toString('base64')
			Users.findOne({ email })
				.exec()
				.then((user) => {
					if (user) {
						return res.send('Usuario ya existe')
					}
					Users.create({
						email,
						password: encryptedPassword,
						salt: newSalt,
						role,
					}).then(() => {
						res.send('Usuario creado con exito')
					})
				})
		})
	})
})

//Inicio recuperacion contraseña

//Forgot password
router.put('/forgot-password', (req, res) => {
	const { email } = req.body

	Users.findOne({ email }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({ error: 'No existe ususario registrado con este mail' })
		}
		const token = jwt.sign({ _id: user._id }, 'forgotpassword12345', { expiresIn: '20m' })
		

		// 								SI EL OBJETIVO ES CLARO, NO HAY EXCUSAS

		return user.updateOne({ resetLink: token }, (err, success) => {
			if (err) {
				return res.status(400).json({ error: 'Link de recuperacion de contraseña erroneo' })
			} else {
				transporter.sendMail({
					from: '"Forgot Password Edu4All" <edu4all.20@gmail.com>', // sender address
					to: email, // list of receivers
					subject: "Recuperacion de cuenta", // Subject line
					html: `
					<h2>Por favor haga click en el siguiente link para cambiar su contraseña</h2>
					<a href="https://edu4all.netlify.app/newPassword.html?token=${token}">Cambiar contraseña</a>
				`
				  }).then( () => res.json({ message: 'El email fue enviado con exito, ingresa para recuperar tu contraseña' }))
				  .catch(err => res.json({ error: err }))
				
			}
		})
	})
})

router.put('/reset-password', (req, res) => {
	const {resetLink, newPassword} = req.body

	if(resetLink){
		jwt.verify(resetLink, 'forgotpassword12345', (err, decodedData) => {
			if(err){
				return res.status(401).json({error: "Token incorrecto o expirado"})
			}
			Users.findOne({resetLink}, (err,user) => {
				if (err || !user) {
					return res.status(400).json({ error: 'No existe usuario con este token o el token se encuentra vencido' })
				}
				crypto.randomBytes(16, (err, salt) => {
					const newSalt = salt.toString('base64')
					crypto.pbkdf2(newPassword, newSalt, 10000, 64, 'sha1', (err, key) => {
						if(err){
							return res.status(400).json({ error: 'Hubo un error'})
						}
						const encryptedPassword = key.toString('base64')
						user.password = encryptedPassword
						user.salt = newSalt
						user.resetLink = ''
						user.save()
						return res.status(200).json({ message: 'Cambio de contraseña correcto'})
					})
				})
			})
		})
	}else{
		return res.status(401).json({error: 'Error de autenticación'})
	}

})

//Fin recuperacion contraseña

module.exports = router
