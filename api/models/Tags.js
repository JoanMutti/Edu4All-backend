const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Tags = mongoose.model('Tag', new Schema({
    nombre: String,
}))

module.exports = Tags