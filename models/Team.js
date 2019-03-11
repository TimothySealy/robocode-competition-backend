let mongoose = require('mongoose')
var Schema = mongoose.Schema

var teamSchema = new Schema({
  code: {type: String, required: true, unique: true, match: /\w/},
  name: {type: String, required: true, unique: true},
  logo: {type: String, required: true, default: "teamlogo_default.png"},
  secret_key: {type: String, required: true},
  competitions: {type: [String]}
});

module.exports = mongoose.model("Team", teamSchema)
