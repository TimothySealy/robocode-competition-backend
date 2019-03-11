let mongoose = require('mongoose')
var Schema = mongoose.Schema

var competitionSchema = new Schema({
  code: {type: String, required: true, unique: true, match: /\w/},
  name: {type: String, required: true, unique: true},
  description: {type: String, required: false},
  current_round: {type: Number},
  rounds: [{type: Number}]
})

module.exports = mongoose.model("Competition", competitionSchema)
