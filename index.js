let express = require('express')

// Initialize the app
let app = express()

// Setup server port
var port = process.env.PORT || 3000

// Hello world on homepage
app.get('/', (req, res) => res.send('Hello World!'))

// Launch app to listen to specified port
app.listen(port, function () {
  console.log('* Robocode competition backend listening on port ' + port)
})
