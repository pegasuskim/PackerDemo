#!/usr/bin/env node
'use strict';
var cluster = require('cluster');
var http = require('http');
var app = require('./app');
var global = require('./common');

if (cluster.isMaster) {
    require('os').cpus().forEach(function() {
        cluster.fork();
    });

    cluster.on('online', function(worker) {
        console.log('worker ' + worker.process.pid + ' is being executed.');
    });

    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        console.log('worker ' + worker.process.pid + ' died ('+exitCode+'). restarting...');
    });

  }else{
      var port = normalizePort(process.env.PORT || global.config.port);
      app.set('port', port);
      var server = http.createServer(app);
      server.listen(port);
      server.on('error', onError);
      server.on('listening', onListening);
}


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
