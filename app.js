const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));
const cors = require('cors');

// var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const issueRouter = require('./routes/issue');
const incidentRouter = require('./routes/incident');
const mailRouter = require('./routes/mail');
const responseRouter = require('./routes/response');
const userRouter = require('./routes/user');
const notificationRouter = require('./routes/notification');
const actionRouter = require('./routes/actionLogs');
const uploadRouter = require('./routes/uploadExcel');
const cronJob = require('./routes/cron-scheduler');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/client/build'));

app.use('/', authRouter);
app.use('/', issueRouter);
app.use('/', incidentRouter);
app.use('/', mailRouter);
app.use('/', responseRouter);
app.use('/', userRouter);
app.use('/', notificationRouter);
app.use('/', actionRouter);
app.use('/', uploadRouter);
// app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});
var serverPort = process.env.PORT || 8181

// start server on the specified port and binding host
app.listen(serverPort, '0.0.0.0', function () {

  // print a message when the server starts listening
  console.log("server starting on " + serverPort);
});

cronJob.cronschedule();

module.exports = app;
