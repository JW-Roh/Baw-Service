var express = require('express')
var http = require('http');
var https = require('https');
var fs = require('fs');
var app = express();
app.set('view engine', 'jade');
app.set('views', './views');
//app.locals.pretty = true;

app.use('/public', express.static('public'));

app.all('/', function (req, res) {
  res.render('index', {hostname: req.hostname});
});

app.use(function(req, res, next) {
  res.status(404);
  res.render('error/404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('error/500')
});

var http_server = http.createServer(app);
var https_server = https.createServer({key: fs.readFileSync('ssl/key.pem'), cert: fs.readFileSync('ssl/cert.pem')}, app);

http_server.listen(8000, function() {
  console.log('Baw Service DashBoard(Admin Panel) server listening on port ' + http_server.address().port);
});
https_server.listen(433, function(){
  console.log("Baw Service DashBoard(Admin Panel) SSL server listening on port " + https_server.address().port);
});
