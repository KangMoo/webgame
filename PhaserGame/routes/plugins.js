var express = require('express');
var router = express.Router();
var fs = require('fs');
const directory = './game/js/plugins';
/* GET users listing. */

router.get('/plugins', function (req, res, next) {
    fs.readFile(drectory+'/'+req, function (error, data) {
      if (error) {
        console.log(error);
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  
    //res.send('respond with a resource');
  });
  
/*
fs.readdir(directory ,(err,files)=>{
    files.forEach(file=>{
        console.log(file);
        router.get('/'+file, function (req, res, next) {
            fs.readFile(directory+'/' + file, function (error, data) {
                if (error) {
                  console.log(error);
                } else {
                  res.writeHead(200);
                  res.end(data);
                }
              });
          });
        });
});

*/
module.exports = router;
