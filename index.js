let express     = require('express')
let mongoose    = require('mongoose')
let bodyParser  = require('body-parser')

// Setup server port and database connection string
var port = process.env.PORT || 3000
var database = process.env.DB_URL || 'mongodb://localhost:27017/robocodecup'

// Initialize the app
let app = express()

// For parsing our request parameters
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Authentication end point
var authn = require('./routes/authentication')
app.use('/api/authenticate', authn)

// Hello world on homepage
app.get('/', (req, res) => res.send('Hello World!'))

// Connect to the database
mongoose.Promise = require('bluebird')
mongoose.connect(database, { useCreateIndex: true, useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('* Connected to database: ' + database)
})

// Launch app to listen to specified port
app.listen(port, function () {
  console.log('* Robocode competition backend listening on port ' + port)
})
