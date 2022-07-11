const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Videos = mongoose.model(
	'Video',
	new Schema({
		nombre: String,
		imagen: String,
		videoId: String,
		duracion: String,
		cursoId: {
			type: Schema.Types.ObjectId,
			ref: 'Curso',
		},
		indice: Number,
	})
)

module.exports = Videos
