var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orm = require('orm');
var auth_middle = require('./middleware/auth');
var cors = require('cors');
var mailer = require('express-mailer');
var general = require('./config/dailycrypto');

//Controllers
var authController = require('./controllers/auth');
var supervisorController = require('./controllers/supervisor');
var employeeController = require('./controllers/employee');
var invoiceController = require('./controllers/invoice');
var contractController = require('./controllers/contract');
var stateController = require('./controllers/state');
var tractController = require('./controllers/tract');
var dailyController = require('./controllers/daily');
//Public controllers
var supervisorPublicController = require('./controllers/supervisorPublic');
var employeePublicController  = require('./controllers/employeePublic');

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

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'dailyappmail@gmail.com',
    pass: 'Dailyapp123'
  }
});

/*SEND RECOVERY PASSWORD EMAIL ROUTE*/
app.get('/sendRecoveryPassMail/:email/:pass', function(req,res,next){
  app.mailer.send('recoveryPasswordMail',
  {
    to: req.params.email,
    subject: 'Recuperar contraseña',
    pass: general.decrypt(req.params.pass)
  }, function(err){
    if (err) {
      console.log(err);
      res.status(500);
    }
    res.status(200).json({message: 'email sent'});
  })
});

//Routes
app.use('/auth', authController);
app.use('/supervisorsPublic', supervisorPublicController);
app.use('/employeesPublic', employeePublicController);

//Protected routes
//app.use(auth_middle);
app.use('/supervisors', supervisorController);
app.use('/employees', employeeController);
app.use('/contracts', contractController);
app.use('/invoices', invoiceController);
app.use('/states', stateController);
app.use('/tracts', tractController);
app.use('/daily', dailyController);

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
