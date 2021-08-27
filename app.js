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
var userRouter = require('./routes/user');
var socialRouter = require('./routes/social');

var admin = require('firebase-admin');

(async () => {
  var serviceAccount = await require('./config/firebase');
  await admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fleek-df27e-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
  //console.log(await admin.auth().getUser('LVIAkJINHFWG8CoG52Ah1QYfYac2'))

  /*
  let realtimeDatabase = admin.database();
  const result = await realtimeDatabase.ref('temp').once('value');
  console.log(result.val())
  var adaNameRef = admin.database().ref('temp');
  adaNameRef.update({ first: 'Adadsfaafsdf', last: 'Lovelace' });
  */
// console.log(await admin.database().ref('sessionLikef').once('value').val())
/*
 console.log(await (await admin.database().ref('sessionLike').child(735).child(0).child('users').once('value')).val())
  admin.database().ref('sessionLike').child(744).update({
    42:admin.database.ServerValue.increment(0),
    13241:[-1]
  });
  admin.database().ref('sessionLike').on('value', (snapshot)=> {
    console.log(snapshot.val());
  })*/
  //console.log(await (await admin.database().ref('sessionLike').child(735).once('value')).val())

  await admin.messaging().sendToDevice(
    ['ejwscaBfSaqaweUudf7Toy:APA91bGdL_p2C9oOyp4oBQe8_5FoX66efdaGb95AmJU9Wiq0zmtGcxWQDWtCJKBlpcV2qC9pDVbgdk1wHOoZXPpuw23nrDwmq2tY4W0YsGq4xc8S5VCWYxBJBpA47fb2scmoTQIfYw_B'], // ['token_1', 'token_2', ...]
    {
      notification: {
        title: '$FooCorp up 1.43% on the day',
        body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.'
      }
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: "high",
    }
  );
  /*
  await admin.messaging().sendToDevice(
    ['ejwscaBfSaqaweUudf7Toy:APA91bGdL_p2C9oOyp4oBQe8_5FoX66efdaGb95AmJU9Wiq0zmtGcxWQDWtCJKBlpcV2qC9pDVbgdk1wHOoZXPpuw23nrDwmq2tY4W0YsGq4xc8S5VCWYxBJBpA47fb2scmoTQIfYw_B'], // ['token_1', 'token_2', ...]
    {
      data: {
        title: '$FooCorp up 1.43% on the day',
        body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.'
      }
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: "high",
    }
  );*/

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
app.use('/user', userRouter);
app.use('/social', socialRouter);

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
