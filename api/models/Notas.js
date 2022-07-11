const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Notas = mongoose.model(
	'Nota',
	new Schema({
		userId: String,
		cursoId: {
			type: Schema.Types.ObjectId,
			ref: 'Curso',
		},
		videoId: String,
		title: String,
		nota: String,
	})
)

module.exports = Notas
