const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cursos = mongoose.model(
	'Curso',
	new Schema({
		nombre: String,
		autor: String,
		canalYoutube: String,
		tags: [String],
		videos: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Video',
			},
		],
		canalChat: String,
		valoracion: {
			valor: { type: Number, default: 5 },
			sumaTotal: { type: Number, default: 5 },
			cantVotos: { type: Number, default: 1 },
		},
	})
)

module.exports = Cursos
