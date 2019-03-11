module.exports = {
  'port': process.env.PORT || 3000,
  'secret': process.env.JWT_SECRET || 'robocode-competition-jwt-secret',
  'database': process.env.DB_URL || 'mongodb://localhost:27017/robocodecup',
}
