var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');
module.exports = async (req, res) => {
  if(req.user) {
    var service = req.params.service
    if(service == 1) {
      var data = {
        "name": "후원",
        "service": 1
      }
      var list = ["nick", "bal", "method", "pin", "bouns", "nname", "code", "ip", "date", "email"];
      var korean = ["닉네임", "후원 금액", "후원 방법", "핀번호", "원하는 보상", "입금자명", "발행일(인증코드)", "IP", "날짜", "이메일"]
      var json = ["bal", "method", "pin", "bouns", "nname", "code", "email"]
      var page = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=1 AND owner=?", [req.user.id]))
      if(page.length == 0) {
        req.session.error = '후원 홈페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!'
        return res.redirect('/manage')
      }
      var rows = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=0 AND owner=? AND service=1", [req.user.id]))
      res.render('manage/view', {rows, data, list, korean, json})
    } else {
      var data = {
        "name": "정품 인증",
        "service": 2
      }
      var list = ["nick", "ip", "date"];
      var korean = ["닉네임", "IP", "날짜"];
      var page = await sqlp(sql, SqlString.format("SELECT * FROM pages WHERE service=2 AND owner=?", [req.user.id]))
      if(page.length == 0) {
        req.session.error = '정품인증 페이지가 존재하지 않습니다. 먼저 페이지를 생성해주세요!'
        return res.redirect('/manage')
      }
      var rows = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE status=0 AND owner=? AND service=2", [req.user.id]))
      res.render('manage/view', {rows, data, list, korean, json: []})
    }
  } else {
    res.redirect('/auth/login')
  }
}
