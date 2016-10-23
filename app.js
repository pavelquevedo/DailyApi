var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orm = require('orm');
var auth_middle = require('./middleware/auth');
var cors = require('cors');

//Controllers
var authController = require('./controllers/auth');
var supervisorController = require('./controllers/supervisor');
var employeeController = require('./controllers/employee');
var invoiceController = require('./controllers/invoice');
var contractController = require('./controllers/contract');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
  extended: true 
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//Routes
app.use('/auth', authController);
app.use('/supervisors', supervisorController);

//Protected routes
//app.use(auth_middle);
app.use('/employees', employeeController);
app.use('/invoices', invoiceController);
app.use('/contract', contractController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
    /*res.render('error', {
      message: err.message,
      error: err
    });*/
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.message);
  /*res.render('error', {
    message: err.message,
    error: {}
  });*/
});


module.exports = app;
