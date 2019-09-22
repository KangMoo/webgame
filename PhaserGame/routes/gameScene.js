var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
    //var game = 'FlappyBird';
    var game = 'SocketCommunicationTest';
    fs.readFile(`./games/${game}/index.html`,function(error,data)
    {
      if(error){
        console.log(error);
      }else{
        res.writeHead(200);
        res.end(data);
      }
    });

    //res.send('respond with a resource');
});

module.exports = router;
