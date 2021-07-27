var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var indexRouter = require('./routes/index');
var signupRouter = require('./routes/signup');
var workoutsRouter = require('./routes/workouts');
var sessionRouter = require('./routes/session');
var followRouter = require('./routes/follow');
var templateRouter = require('./routes/template');
var calendarRouter = require('./routes/calendar');
var programRouter = require('./routes/program');
var dashboardRouter = require('./routes/dashboard');

var admin = require('firebase-admin');

(async () => {
  var serviceAccount = await require('./config/firebase');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
})();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/workouts', workoutsRouter);
app.use('/session', sessionRouter);
app.use('/follow', followRouter);
app.use('/template', templateRouter);
app.use('/calendar', calendarRouter);
app.use('/program', programRouter);
app.use('/dashboard', dashboardRouter);

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

module.exports = app;
