var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');

// db connect
var connection = mysql.createConnection({
  host     : 'web-database.ct82p2wdqupw.ap-northeast-2.rds.amazonaws.com',
  user     : 'root',
  password : 'test123!',
  port     : '3306'
});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource helloworld');
});

/* 로그인 */
router.post("/login", async function(req, res, next){
  //console.log(req.body);

  // `innodb`.`Users` (`UserEmail`, `UserPwd`, `UserName`)
  var sql = 'SELECT * FROM `innodb`.`Users` WHERE UserEmail = ? and UserPwd = ?';
  var params = [req.body.id, req.body.pw];

  connection.query(sql, params, function (err, results, fields) {
      console.log(results);

      if (err) {
          console.log(err);
      } else if (!err) {
          var responseData = {'result' : 'ok', 'user' : results};
          res.json(responseData);
      }
  });
});


/* 회원가입 */
router.post("/join", async function(req, res, next){
  //console.log(req.body);

  // `innodb`.`Users` (`UserEmail`, `UserPwd`, `UserName`)
  var sql = 'INSERT INTO `innodb`.`Users` (`UserEmail`, `UserPwd`, `UserName`) VALUES (?, ?, ?)';
  var params = [req.body.id, req.body.pw, 'user_name'];

  connection.query(sql, params, function (err, results, fields) {
      console.log(results);

      if (err) {
          console.log(err);
          //console.log(err.code);

          if (err.code == 'ER_DUP_ENTRY') {
              var responseData = {'result' : 'error', 'reason' : 'duplicate'};
              res.json(responseData);
          }
      } else if (!err) {
          var responseData = {'result' : 'ok', 'user' : results};
          res.json(responseData);
      }
  });
});

//connection.end();

module.exports = router;
