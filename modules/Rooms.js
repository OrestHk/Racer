var path      = require('path');
var Player    = require(__root + 'modules/Player.js');
var Game      = require(__root + 'modules/Game.js');

module.exports = Rooms;

function Rooms(router, ws){
  /* Server references */
  this.ws = ws;
  this.router = router;
  // Socket.io rooms
  this.sRooms = ws.sockets.adapter.rooms;
  /* End server references */

  // List of available and soon to be created rooms
  this.rooms = [];
  // List of all games launched and waiting to be launched
  this.games = {};

  // Launch route handler
  this.handleRoute();
}

/* Room request handler */
Rooms.prototype.request = function(socket, name){
  if(this.exist(name)){
    if(this.creating(name))
      this.create(socket, name);
    else
      this.join(socket, name);
  }
};
/* End room request handler */

/* Join room */
Rooms.prototype.join = function(socket, name){
  socket.join(name);
  this.games[name].addPlayer(new Player(socket, name, this.games[name]));
};
/* End join room */

/* Room creation */
Rooms.prototype.creation = function(socket){
  var name = this.getName();
  this.rooms.push(name);
  socket.emit('join', name);
};

Rooms.prototype.create = function(socket, name){
  socket.join(name);
  this.games[name] = new Game(this.ws, name);
  this.games[name].addPlayer(new Player(socket, name, this.games[name]));
};

Rooms.prototype.getName = function(){
  var name = '';
  var length = 8;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++){
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  if(this.sRooms.hasOwnProperty(name)){
    this.getName();
    return false;
  }

  return name;
};
/* End room creation */

/* Room status */
Rooms.prototype.creating = function(name){
  if(this.games[name])
    return false;
  else
    return true;
};

Rooms.prototype.exist = function(name){
  if(this.rooms.indexOf(name) != -1)
    return true;
  else
    return false;
};

Rooms.prototype.full = function(name){
  var room = this.sRooms[name];
  var count = 0, player;

  for(player in room){
    if(room.hasOwnProperty(player))
      count++;
  }

  if(count < 4)
    return false;
  else
    return true;
};
/* End room status */

Rooms.prototype.handleRoute = function(){
  var _this = this;
  this.router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../front/home.html'));
  });
  this.router.get("/game/:game",function(req, res){
    var name = req.params.game;
    if(_this.exist(name)){
      if(_this.creating(name))
        res.sendFile(path.join(__dirname, '../front/game.html'));
      else{
        if(!_this.full(name))
          res.sendFile(path.join(__dirname, '../front/game.html'));
        else
          res.sendFile(path.join(__dirname, '../front/full.html'));
      }
    }
    else
      res.sendFile(path.join(__dirname, '../front/404.html'));
  });
  this.router.get("*",function(req, res){
    res.sendFile(path.join(__dirname, '../front/404.html'));
  });
};
