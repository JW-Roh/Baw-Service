var sql = require('../../config/dbtool')
var sqlp = require('../../libs/sql-promise')
var SqlString = require('sqlstring')

module.exports = async (req, res) => {
  if (req.user) {
    var data = {
      "name": "나의 정보 수정"
    }
    var options = {
      "groups": {
        "general": {
          korean: "일반",
          description: "계정 일반 설정",
          text: [
            { name: "id", korean: "아이디", help: "고객센터에서 수정이 가능합니다.", disabled: true },
            { name: "svname", korean: "서버 이름" },
            { name: "mail", korean: "메일", help: "고객센터에서 수정이 가능합니다.", disabled: true },
            { name: "ninfo", korean: "계좌 정보" }
          ]
        },
        "password": {
          korean: "비밀번호",
          description: "비밀번호를 변경하려면 아래칸을 채우세요.",
          password: [
            { name: "oldpass", korean: "기존 비밀번호" },
            { name: "pass1", korean: "새 비밀번호" },
            { name: "pass2", korean: "새 비밀번호 확인" }
          ]
        }
      },
      "savetojson": ["svname", "ninfo"]
    }

    var rows = await sqlp(sql, SqlString.format("SELECT * FROM users WHERE id=?", [req.user.id]))
    var pagedata = JSON.parse(rows[0]['userdata'])
    res.render('manage/edit', { data, rows, pagedata, options })
  } else {
    res.redirect('/auth/login')
  }
}
