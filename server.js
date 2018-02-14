
const express = require('express'),  
    app = express(require('express-logger')),
    server = require('http').createServer(app),
    io = require('socket.io')(server);
    _ = require('underscore');
    path = require('path');
    mongoose = require('mongoose');
    morgan = require('morgan');
    jwt    = require('jsonwebtoken');
    bodyParser    = require('body-parser');

const moment = require('moment');
const striptags = require('striptags');
const sleep = require('sleep');

const config = require('./mod/config');
const schema = require('./mod/schema');

const port = process.env.PORT || 8080;
// set the view engine to ejs
app.set('view engine', 'ejs');

require('./mod/connect')();

app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('cookie-parser')()); 
app.use(morgan('dev'));

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)


// set the home page route
// app.configure('development', function() {  
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
// });

// app.configure('production', function() {  
//   app.use(express.errorHandler());
// });



// io.configure(function () {  
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });


//Routes
app.use(express.static(path.join(__dirname,'public')));
app.use('/session',express.static(path.join(__dirname,'public')));
app.use('/admin',express.static(path.join(__dirname,'public')));

app.use('/session',require('./mod/session'));
app.use('/admin', require('./mod/admin'));
app.use('/',require('./mod/index'));


//socket
var users = [];
var socketConnections = {};
//const io = require('socket.io')(server);
socket_events = require('./mod/socket');
socket_events(io,server,users,socketConnections);


//server listening
server.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});


process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    io.sockets.emit('ErrorLine', {"status":'Server unavialable!'})

    if (options.exit) process.exit();
}
//process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 15;
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}