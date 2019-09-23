var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gamesceneRouter = require('./routes/gameScene');
var heejeRouter = require('./routes/heeje');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/gameScene',gamesceneRouter);
app.use('/heeje',heejeRouter);

app.use(express.static('./games/FlappyBird'));
app.use(express.static('./games/SocketCommunicationTest'));
app.use(express.static('./games/heeje'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

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

connection.end();

module.exports = app;
