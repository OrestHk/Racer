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

// GAME VARS
// var racer = new Game(ws);

// SOCKET HANDLER
ws.on('connection', function(socket){

  // Room request handler
  socket.on('createGame', function(){
    roomHandler.creation(socket);
  });
  // socket.on('joinGame', function(){
  //   roomHandler.creationRequest(socket);
  // });
  // socket.on('findGame', function(name){
  //   roomHandler.creationRequest(socket);
  // });

  // If user is in a room
  socket.on('requireGame', function(name){
    roomHandler.request(socket, name, true);
    //racer.addPlayer(new Player(socket, ws, racer));
  });

  socket.on('disconnect', function(){
    console.log('Socket : '+socket.id+' left');
    // socket.broadcast.emit('destroy', socket.id);
    // racer.deletePlayer(socket.id);
  });
});

// SERVER LISTENER
serv.listen(app.get('port'), function(){
    console.log('Server Listening to port '+app.get('port'));
});
