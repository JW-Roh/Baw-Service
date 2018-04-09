var sql = require('../../config/dbtool');
var server_settings = require('../../config/server_settings');
var SqlString = require('sqlstring');
var request = require('request');
var vali = require('validator');
function isset(text) {
  if(vali.isEmpty(text) == false) {
    return true;
  } else {
    return false;
  }
}


function complete(req, res){
  return new Promise(function (resolve, reject) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      }
    });

    var nick = req.body.nick
    var bal = req.body.bal
    var nname = req.body.nname
    var Combo = req.body.Combo
    if (Combo != "틴캐시") {
      var pin1 = req.body['pin1[]'][0]
      var pin2 = req.body['pin2[]'][0]
      var pin3 = req.body['pin3[]'][0]
      var pin4 = req.body['pin4[]']
    } else {
      var pin1 = req.body['pin1[]'][1]
      var pin2 = req.body['pin2[]'][1]
      var pin3 = req.body['pin3[]'][1]
    }
    var Radio = req.body.Radio
    var page = req.body.page
    var code = req.body.code
    var date = new Date().toLocaleDateString()
    var ip = req.connection.remoteAddress
    if(vali.isEmpty(nick) || nick.length > 18){
      return reject('닉네임을 입력해주세요.')
    }
    if(vali.isEmpty(bal) || bal.length > 18){
      return reject('후원금액을 입력해주세요.')
    }
    if(vali.isEmpty(Combo) || Combo.length > 18){
      return reject('후원방법을 선택해주세요.')
    }
    if(Combo != "계좌이체") {
      if(vali.isEmpty(pin1) || pin1.length != 4){
        return reject('핀번호1를 입력해주세요.')
      }
      if(vali.isEmpty(pin2) || pin2.length != 4){
        return reject('핀번호2를 입력해주세요.')
      }
      if(vali.isEmpty(pin3) || pin3.length != 4){
        return reject('핀번호3를 입력해주세요.')
      }
      if(Combo != "틴캐시") {
        if(vali.isEmpty(pin4) || pin1.length > 6 || pin4.length < 3 || pin4.length == 5){
          return reject('핀번호4를 입력해주세요.')
        }
      }
    } else {
      if(vali.isEmpty(nname)) {
        return reject('입금자를 입력해주세요.')
      }
    }
    if(Combo == "틴캐시" || Combo == "도서문화상품권") {
      if(vali.isEmpty(code) || code.length > 18){
        return reject('인증 번호(발행일)을 입력해주세요.')
      }
    }
    console.log("HD")

    var sql_req = sql('SELECT * FROM page WHERE name='+ SqlString.escape(page)+' and service=1', function(err, rows) {
      if (err) { return reject('1번 질의 오류') }
      if (rows.length == 0) { return reject('후원 홈페이지가 존재하지 않습니다.') }
      var sql_req2 = sql('SELECT * FROM id WHERE id='+ SqlString.escape(rows[0]['owner']), function(err, rows2) {
        if (err) { return reject('2번 질의 오류') }
        var sql_req3 = sql('SELECT * FROM service1 ORDER BY `num` ASC', function(err, rows3) {
          if (err) { return reject('3번 질의 오류') }
          var counter = rows3.length;
          rows3.forEach(function(item) {
            counter -= 1;
            if ( counter === 0){
              var no = item.num + 1
              if(Combo == "틴캐시"){
      	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?-?-?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pin1, pin2, pin3, Combo, code, Radio, ip, date]);
               } else if (Combo == "계좌이체") {
         	       var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, "없음", ?, ?, ?, ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, Combo, code, nname, Radio, ip, date]);
               } else {
       	         var sql_Request = SqlString.format('INSERT INTO service1 values (?, ?, ?, ?, ?, ?-?-?-?, ?, ?, "없음", ?, ?, ?, 0)', [no, page, rows[0]['owner'], nick, bal, pin1, pin2, pin3, pin4, Combo, code, Radio, ip, date]);
               }
              var sql_req4  = sql(sql_Request, function(err, rows4) {
                if (err) { return reject('4번 질의 오류'); }

                if(rows[0]['mail_ok'] == 1) {
                  var nodemailer = require('nodemailer');
                  var transporter = require('../../libs/mail_init');
                  var mailOptions = {
                    from: 'Baw Service <A-Mail-Sender@rpgfarm.com>',
                    to: rows2[0]['mail'],
                    subject: '[Baw Service] 새로운 후원 요청이 있습니다!',
                    html: "<p>Baw Service에서 새로운 정품 인증 요청이 있습니다!</p><p>후원 관리 사이트를 확인해주세요!</p><p><a href=\"https://"+req.hostname+"/manage/2/view\">[Baw Service 관리 사이트]</a></p><p>Powered by <a href='https://baws.kr/'>Baw Service</a></p>"
                  };
                  transporter.sendMail(mailOptions, function(error, info) {
                    transporter.close();
                    if(error) {
                      return return reject('후원 등록에는 성공하였으나 알림 메일 발송 오류입니다. 후원 사실을 서버 관리자에게 직접 알려주세요.')
                    }
                  });
                }

                resolve("<script>alert('등록되었습니다.');location.replace('https://"+req.hostname+"/"+page+"');</script>")
              })
            }
          });
        })
      })
    })
  })
}


module.exports = function(req, res) {
  complete(req, res).then(function (text) {
  	res.send(text);
  }).catch(function (error) {
  	res.send('<script>alert("' + error +'");history.go(-1);</script>')
  });
};
