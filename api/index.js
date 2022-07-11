const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

const cursos = require('./routes/cursos')
const videos = require('./routes/videos')
const auth = require('./routes/auth')
const users = require('./routes/users')
const notas = require('./routes/notas')

const app = express()

app.use(bodyParser.json())

app.use(cors())

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

app.use('/api/cursos', cursos)
app.use('/api/videos', videos)
app.use('/api/auth', auth)
app.use('/api/users', users)
app.use('/api/notas', notas)

module.exports = app
