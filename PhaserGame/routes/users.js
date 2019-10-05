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
  let body = req.body;

  let result = await models.user.findOne({
    where: {
      email : body.userEmail
    }
  });

  let dbPassword = result.dataValues.password;
  let inputPassword = body.password;
  let salt = result.dataValues.salt;
  let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

  if(dbPassword === hashPassword){
    console.log("비밀번호 일치");
    res.redirect("/users");
  }
  else{
    console.log("비밀번호 불일치");
    res.redirect("/users/login");
  }
});


connection.end();

module.exports = router;
