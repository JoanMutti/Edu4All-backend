const express = require('express')
const Videos = require('../models/Videos')
const Cursos = require('../models/Cursos')

const router = express.Router()

//Create a video
router.post('/:id', (req, res) => {
	const cursoId = req.params.id
	Cursos.findById(cursoId)
		.exec()
		.then((curso) => {
			const dataVideo = req.body
			const video = {
				nombre: dataVideo.nombre,
				imagen: dataVideo.imagen,
				videoId: dataVideo.videoId,
				duracion: dataVideo.duracion,
				cursoId: cursoId,
				indice: dataVideo.indice,
			}
			Videos.create(video).then((videoCreado) => {
				console.log(videoCreado)
				curso.videos.push(videoCreado._id)
				Cursos.updateOne({_id: cursoId}, curso).then(() => res.status(201).send('El video fue creado con exito'))
			})
		})
		.catch(() => res.status(403).send('El curso indicado no existe'))
})

//Get a video
router.get('/video/:id', (req, res) => {
	Videos.findById(req.params.id)
		.exec()
		.then((x) => res.status(200).send(x))
})

//Get all course's videos
router.get('/curso/yt/:id', (req, res) => {
	Videos.find({ videoId: req.params.id })
		.exec()
		.then((x) => res.status(200).send(x))
})

//Get all course's videos
router.get('/curso/:id', (req, res) => {
	Videos.find({ cursoId: req.params.id })
		.exec()
		.then((x) => res.status(200).send(x))
})

//Update a video
router.put('/:id', (req, res) => {
	Videos.findByIdAndUpdate(req.params.id, req.body).then(() => res.sendStatus(204))
})

//Delete a video
router.delete('/:id', (req, res) => {
	const videoId = req.params.id

	Videos.findById(videoId)
		.exec()
		.then((video) => {
			Cursos.findById(video.cursoId)
				.exec()
				.then((curso) => {
					const indice = curso.videos.indexOf(video._id)
					if (indice !== -1) {
						curso.videos.splice(indice, 1)
					}
					Cursos.findByIdAndUpdate(curso._id, curso).then(() => {
						Videos.findOneAndDelete(videoId)
							.exec()
							.then(() => res.status(200).send('Video eliminado con exito'))
					})
				})
		})
		.catch(() => res.status(403).send('El video indicado no existe'))
})

module.exports = router
