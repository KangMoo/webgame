var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  var game = 'FlappyBird';
  fs.readFile(`./games/${game}/index.html`,function(error,data)
  {
    if(error){
      console.log(error);
    }else{
      res.writeHead(200);
      res.end(data);
    }
  });


  
  //res.render('index', { title: 'Express' });
});

module.exports = router;
