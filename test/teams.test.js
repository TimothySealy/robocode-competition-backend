const app     = require('../index.js')
const chai    = require('chai')
const request = require('supertest')

let expect = chai.expect
describe("* Team test",function () {

  // Actual tests
  it('should produce a list of teams', function (done) {
    request(app)
      .get('/api/teams')
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200)
      .send({})
      .end(function(err, res) {
        if (err) {
          return done(err)
        }
        expect(res.body).to.be.an('object')
        expect(res.body.success).to.be.true
        expect(res.body.message).to.equal('Teams succesfully retrieved')
        expect(res.body.teams).to.be.an('array')
        expect(res.body.teams).to.be.empty

        done()
      })
  })
})
