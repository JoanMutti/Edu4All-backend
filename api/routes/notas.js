const express = require('express')
const { isAuthenticated, hasRoles } = require('../auth')
const Notas = require('../models/Notas')
const Users = require('../models/Users')

const router = express.Router()

//bring a note by note ID
router.get(
	'/single/:id',
	isAuthenticated,
	hasRoles(['user', 'admin']),
	(req, res) => {
		Notas.findById(req.params.id)
			.exec()
			.then((x) => res.status(200).send(x))
	}
)

//Delete a note by id
router.delete('/:id', (req, res) => {
	Notas.findByIdAndDelete(req.params.id)
		.exec()
		.then(() => res.status(200).send('Nota eliminada con exito'))
})

//Get all notes
router.get('/all', (req, res) => {
	Notas.find()
		.exec()
		.then((x) => res.status(200).send(x))
})

//Bring all user's notes
router.get('/', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Notas.find({ userId: req.user._id })
		.exec()
		.then((x) => res.status(200).send(x))
		.catch((x) => res.send())
})

//Create new note
router.post('/', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	let newNota = {
		userId: req.user._id,
		cursoId: req.body.cursoId,
		videoId: req.body.videoId,
		title: req.body.title,
		nota: req.body.nota,
	}
	Notas.create(newNota).then((x) => {
		let nota = x
		Users.findById(req.user._id)
			.exec()
			.then((x) => {
				let notas = x.notas
				notas.push(nota._id)
				Users.findByIdAndUpdate(req.user._id, { notas: notas })
					.exec()
					.then((x) => res.status(200).send('Nota creada'))
			})
	})
})

//Update a note
router.put('/:id', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Notas.findByIdAndUpdate(req.params.id, { nota: req.body.nota })
		.exec()
		.then((x) => res.status(200).send('Nota actualizada'))
})

//Get a specific note by userId and videoId
router.get('/:id', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Notas.find({ userId: req.user._id, videoId: req.params.id })
		.exec()
		.then((x) => res.status(200).send(x))
		.catch((err) => res.status(403).send(false))
})

module.exports = router
