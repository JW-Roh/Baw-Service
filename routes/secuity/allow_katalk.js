var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
  if(req.user) {
    res.render('/secuity/allow_katalk')
  } else {
    res.redirect('/auth/login')
  }
}