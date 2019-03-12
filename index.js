let config      = require('./config')
let express     = require('express')
let mongoose    = require('mongoose')
let bodyParser  = require('body-parser')

// Initialize the app
let app = express()

// For parsing our request parameters
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// API endpoints
app.use('/api', require('./routes/help'))
app.use('/api/authenticate', require('./routes/authentication'))
app.use('/api/battles', require('./routes/battles'))
app.use('/api/competitions', require('./routes/competitions'))
app.use('/api/rankings', require('./routes/rankings'))
app.use('/api/teams', require('./routes/teams'))

// Configure static folders
app.use('/apidoc', express.static('apidoc'))

// Details on homepage
app.get('/', (req, res) => res.status(200).json({succes:true, message: 'See /api for more details'}))

// Connect to the database
mongoose.Promise = require('bluebird')
mongoose.connect(config.database, { useCreateIndex: true, useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error : '))
db.once('open', function () {
  console.log('* Connected to database: ' + config.database)
})

// Launch app to listen to specified port
app.listen(config.port, function () {
  console.log('* Robocode competition backend listening on port ' + config.port)
})
