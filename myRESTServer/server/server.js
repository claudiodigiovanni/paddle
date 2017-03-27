var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('lodash');


//*******************
//require('look').start();
//*******************

var init = require('./initialize.js');

var app = express();

//app.use(logger('dev'));
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));



process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
  
}); 


mongoose.set('debug', true);
mongoose.connect("mongodb://mybooking:mareblu69030303@127.0.0.1:27017/paddle");
//mongoose.connect("mongodb://127.0.0.1:27017/mybooking");
mongoose.connection.on('error', function () {
    debug('Mongoose connection error');
});


app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key,X-Device-Token');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Only the requests that start with /api/v1/* will be checked for the token.
app.all('/api/v1/*', [require('./middlewares/validateRequest')]);



//app.all('/api/v1/admin/*', [require('./middlewares/authorizeRequest')]);

app.use('/', require('./routes.js'));

// Error Handler
app.use(function(err, req, res, next) {
	console.log('*************************Error Handler********************')
	console.log(err.stack)
  	res.status(err.status || 500);
    res.json({error: err.message})
 });
  

//init.initDB();

// Start the server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
