'use strict';

// REQUIRE
var http      = require('http');
var path      = require('path');
// Base
global.__root = __dirname + '/';
var io        = require('socket.io');
var xpress    = require('express');
var Rooms     = require('./modules/Rooms.js');

// SERVER SETTINGS
var app         = xpress();
var serv        = http.createServer(app);
var ws          = io(serv);
var router      = xpress.Router();
var roomHandler = new Rooms(router, ws);

app.set('port', process.env.PORT || 145);
app.use(xpress.static(path.join(__dirname, 'front/')), router);

// SOCKET HANDLER
ws.on('connection', function(socket){

  /* Room request handler */
  socket.on('createGame', function(){
    // Create a game (and a room)
    roomHandler.creation(socket);
  });
  socket.on('joinGame', function(){
    // Join a random game
    roomHandler.random(socket);
  });
  socket.on('findGame', function(name){
    // Find a game by name
    socket.emit('join', name);
  });
  /* End room request handler */

  // User wants to play in particular room
  socket.on('requireGame', function(name){
    roomHandler.request(socket, name);
  });
  
});

// SERVER LISTENER
serv.listen(app.get('port'), function(){
    console.log('Server Listening to port '+app.get('port'));
});
