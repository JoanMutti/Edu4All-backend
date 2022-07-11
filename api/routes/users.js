const express = require('express')
const Users = require('../models/Users')
const Notas = require('../models/Notas')
const Cursos = require('../models/Cursos')
const Videos = require('../models/Videos')
const { isAuthenticated, hasRoles } = require('../auth')
const router = express.Router()


//Bring all users
router.get('/', isAuthenticated, hasRoles(['admin']), (req, res) => {
	Users.find()
		.exec()
		.then((x) => res.status(200).send(x))
})

//Bring all users - only some information
router.get('/users-data', async (req, res) =>{
	const users = await Users.find({ role: 'user'}).select(['nombre', 'apellido', 'email', 'cursoEnCurso' ])
	res.status(200).send({countUsers: users.length, users})
})


//Bring one User
router.get('/profile', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findById(req.user.id)
		.exec()
		.then((x) => res.status(200).send({
			apellido: x.apellido,
			nombre: x.nombre,
			cursoEnCurso: x.cursoEnCurso,
			cursosTerminados: x.cursosTerminados,
			email: x.email,
			favoritos: x.favoritos,
			fechaNacimiento: x.fechaNacimiento,
			intereses: x.intereses,
			nacionalidad: x.nacionalidad,
			notas: x.notas,
			sexo: x.sexo
		}))
})

//Delete one user by id
router.delete('/:id', isAuthenticated, hasRoles(['admin']), (req, res) => {
	Users.findByIdAndDelete(req.params.id)
		.exec()
		.then((x) => res.status(200).send('Usuario eliminado con exito'))
})

//Put interestings
router.put('/intereses', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findByIdAndUpdate(req.user.id, { intereses: req.body.intereses })
		.exec()
		.then((x) => res.status(200).send('Intereses cargados'))
})

//Put favourites
router.put('/favoritos/:id', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findById(req.user.id)
		.exec()
		.then((user) => {
			let favourites = user.favoritos
			const indice = favourites.indexOf(req.params.id)
			if (indice === -1) {
				favourites.push(req.params.id)
				Users.findByIdAndUpdate(req.user.id, { favoritos: favourites })
					.exec()
					.then((x) => res.status(200).send('Favoritos actualizados'))
				res.status(200).send('favorito actualizado')
			} else {
				console.log(favourites)
				res.status(200).send('Favorito ya existe')
			}
		})
})

//Delete Favourite
router.put('/deleteFavourite/:id', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findById(req.user.id)
		.exec()
		.then((user) => {
			let favourites = user.favoritos
			const indice = favourites.indexOf(req.params.id)
			if (indice !== -1) {
				favourites.splice(indice, 1)
				Users.findByIdAndUpdate(req.user.id, { favoritos: favourites })
					.exec()
					.then((x) => res.status(200).send('Favorito Eliminado'))
			} else {
				res.status(200).send('Favorito no existe')
			}
		})
})

//Put Personal Data
router.put('/personalData/add', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findByIdAndUpdate(req.user.id, {
		nombre: req.body.nombre,
		apellido: req.body.apellido,
		fechaNacimiento: req.body.fechaNacimiento,
		nacionalidad: req.body.nacionalidad,
		sexo: req.body.sexo,
	})
		.exec()
		.then((x) => res.status(200).send('Datos personales actualizados'))
})

//Put skills
router.put('/skills', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findByIdAndUpdate(req.user.id, { skills: req.body.skills })
		.exec()
		.then((x) => res.status(200).send('Skills actualizados'))
})

//Put curso en curso
router.put('/enCurso', isAuthenticated, hasRoles(['user', 'admin']), (req, res) => {
	Users.findById(req.user.id)
		.exec()
		.then((x) => {
			if (x.cursoEnCurso.filter((e) => String(e.idCurso) === req.body.cursoId).length > 0) {
				let newArray = x.cursoEnCurso.map((element) => {
					if (String(element.idCurso) === req.body.cursoId) {
						element.idVideo = req.body.videoId
						return element
					}
					return element
				})
				Users.findByIdAndUpdate(req.user.id, { cursoEnCurso: newArray })
					.exec()
					.then((x) => res.status(200).send({
						apellido: x.apellido,
						nombre: x.nombre,
						cursoEnCurso: x.cursoEnCurso,
						cursosTerminados: x.cursosTerminados,
						email: x.email,
						favoritos: x.favoritos,
						fechaNacimiento: x.fechaNacimiento,
						interes: x.interes,
						nacionalidad: x.nacionalidad,
						notas: x.notas,
						sexo: x.sexo
					}))
			} else {
				let newArray = x.cursoEnCurso
				let newCursoEnCurso = {
					idCurso: req.body.cursoId,
					idVideo: req.body.videoId,
					show: true,
				}
				newArray.push(newCursoEnCurso)
				Users.findByIdAndUpdate(req.user.id, { cursoEnCurso: newArray })
					.exec()
					.then((x) => res.status(200).send({
						apellido: x.apellido,
						nombre: x.nombre,
						cursoEnCurso: x.cursoEnCurso,
						cursosTerminados: x.cursosTerminados,
						email: x.email,
						favoritos: x.favoritos,
						fechaNacimiento: x.fechaNacimiento,
						interes: x.interes,
						nacionalidad: x.nacionalidad,
						notas: x.notas,
						sexo: x.sexo
					}))
			}
		})
})

//Bring all notes user
router.get('/Notas/All', isAuthenticated, hasRoles(['user', 'admin']), async (req, res) => {
	let infoNotas = []
	let notes = await Notas.find({ userId: req.user.id }).exec()
	for (let i = 0; i < notes.length; i++) {
		let curso = await Cursos.findById(notes[i].cursoId).exec()
		let video = await Videos.find({ videoId: notes[i].videoId }).exec()
		let nota = {
			idNota: notes[i]._id,
			curso: curso.nombre,
			video: video[0].nombre,
		}
		infoNotas.push(nota)
	}
	res.status(200).send(infoNotas)
})

//Get all my courses
router.get('/mycourses', isAuthenticated, hasRoles(['user', 'admin']), async (req, res) => {
	let mycourses = []
	const user = await await Users.findById(req.user.id)
		.populate({
			path: 'cursoEnCurso',
			populate: [
				{ path: 'idVideo', select: ['imagen', 'nombre', 'videoId'] },
				{ path: 'idCurso', select: ['nombre', 'autor', 'valoracion'] },
			],
		})
		.populate({
			path: 'favoritos',
			select: ['nombre', 'autor', 'valoracion', 'videos'],
			populate: { path: 'videos', select: ['imagen', 'videoId'] },
		})
		.populate({
			path: 'cursosTerminados',
			populate: {
				path: 'idCurso',
				select: ['nombre', 'autor', 'valoracion', 'videos'],
				populate: { path: 'videos', select: ['imagen', 'videoId'] },
			},
		})
		.exec()
	const { intereses, cursosTerminados, cursoEnCurso, favoritos } = user
	for (interes of intereses) {
		let tempCursos = await Cursos.find({ tags: interes })
			.populate({
				path: 'videos',
				select: ['imagen', 'nombre', 'videoId'],
			})
			.exec()
		mycourses.push(...tempCursos)
	}
	const setCourses = new Set(mycourses.map(JSON.stringify))
	const mycoursesFormat = Array.from(setCourses).map(JSON.parse)

	res.status(200).send({ mycourses: mycoursesFormat, cursoEnCurso, favoritos, cursosTerminados })
})

module.exports = router
