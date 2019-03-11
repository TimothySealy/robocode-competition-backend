let router  = require('express').Router()

router.get('/', function (req, res) {
  let help = {
    success: true,
    message: 'Endpoint retrieved successfully',
    routes: {
      documenation : "/apidoc"
    }
  }
  res.status(200).json(help)
})

module.exports = router
