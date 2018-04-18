var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var vali = require('validator');

function req_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined || req.body[item] == ""){
        reject(true)
      }
    })
    resolve(true)
  })
}
function opt_check(variable, req){
  return new Promise(function (resolve, reject) {
    variable.forEach(function(item) {
      if(req.body[item] == undefined){
        reject(true)
      }
    })
    resolve(true)
  })
}
module.exports = function(req, res) {
  if(req.user) {
    var req_field = ["oldpass", "pass1", "pass2"]
    req_check(req_field, req).then(function (text) {
      if(req.body.pass1 != req.body.pass2){
        res.json({ success: false, title: "비밀번호 불일치",  message: "비밀번호가 서로 일치하지 않습니다." });
      } else {
        sql(SqlString.format('select * from id where id=? and password=password(?)', [req.user.id, req.body.oldpass]), function(err, rows){
          if(rows.length == 0){
            res.json({ success: false, title: "비밀번호 불일치",  message: "기존 비밀번호가 일치하지 않습니다." });
          } else {
            var sql_Request = SqlString.format('UPDATE `id` SET `password`=password(?) WHERE `id`.`id` = ?', [req.body.pass1, req.user.id])
            var sql_req = sql(sql_Request)
            res.json({ success: true, title: "완료했습니다!",  message: "정보 변경 요청이 전달되었습니다." });
          }
        })
      }
    }).catch(function (error) {
      res.json({ success: false, title: "필요 데이터 미전달됨",  message: "설정에 필요한 데이터가 전달되지 않았거나 설정되지 않았습니다." });
    });
  } else {
    res.json({ success: false, title: "권한이 없습니다.",  message: "비밀번호 변경 권한이 없습니다." });
  }
}
