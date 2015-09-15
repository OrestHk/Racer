'use strict';

// REQUIRE
var http      = require('http');
var path      = require('path');
var io        = require('socket.io');
var xpress    = require('express');
var Player    = require('./modules/Player.js');
var Game      = require('./modules/Game.js');

// SERVER SETTINGS
var app       = xpress();
var serv      = http.createServer(app);
var ws        = io(serv);
var router    = express.Router();
app.set('port', process.env.PORT || 145);
app.use(xpress.static(path.join(__dirname, 'front/')));

// Route handler
router.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'front/home.html'));
});
router.get("/game/:game",function(req,res){
  if(rooms.indexOf(req.params.game) != -1)
    res.sendFile(path.join(__dirname, 'front/index.html'));
  else
    res.sendFile(path.join(__dirname, 'front/404.html'));
});
router.get("*",function(req,res){
  res.sendFile(path.join(__dirname, 'front/404.html'));
});
app.use(express.static(path.join(__dirname, 'front/')), router);

// GAME VARS
var racer = new Game(ws);

// SOCKET HANDLER
ws.on('connection', function(socket){

  // If user is in a room
  socket.on('requireGame', function(){
    racer.addPlayer(new Player(socket, ws, racer));
  });

  socket.on('disconnect', function(){
    console.log('Socket : '+socket.id+' left');
    socket.broadcast.emit('destroy', socket.id);
    racer.deletePlayer(socket.id);
  });
});

// SERVER LISTENER
serv.listen(app.get('port'), function(){
    console.log('Server Listening to port '+app.get('port'));
});
