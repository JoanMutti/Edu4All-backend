const mongoose = require('mongoose')
const isEmail = require('validator').isEmail
const Schema = mongoose.Schema

const Users = mongoose.model(
	'User',
	new Schema({
		email: {
			type: String,
			unique: true,
			required: true,
			validate: isEmail,
		},
		sexo: String,
		password: {
			type: String,
			required: true,
		},
		salt: {
			type: String,
			required: true,
		},
		role: { type: String, default: 'user' },
		nombre: {
			type: String,
		},
		apellido: {
			type: String,
		},
		fechaNacimiento: {
			type: Date,
		},
		nacionalidad: {
			type: String,
		},
		descripcion: { type: String, default: '' },
		experienciaLaboral: [
			{
				posicion: String,
				empresa: String,
				fechaInicio: String,
				fechaFin: String,
			},
		],
		skills: [
			{
				skill: String,
				nivel: String,
			},
		],
		avatar: String,
		intereses: [String],
		cursoEnCurso: [
			{
				idCurso: {
					type: Schema.Types.ObjectId,
					ref: 'Curso',
				},
				idVideo: {
					type: Schema.Types.ObjectId,
					ref: 'Video',
				},
				show: Boolean,
			},
		],
		cursosTerminados: [
			{
				idCurso: {
					type: Schema.Types.ObjectId,
					ref: 'Curso',
				},
				valoracion: Number,
			},
		],
		favoritos: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Curso',
			},
		],
		notas: [String],
		options: {
			visibility: { type: Boolean, default: false },
			theme: { type: String, default: 'dark' },
		},
		resetLink: {
			type: String,
			default: '',
		},
	})
)

module.exports = Users
