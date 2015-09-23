var path      = require('path');
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
  // Refresh room list
  this.refresh();
  if(this.exist(name)){
    // If the wanted room need to be created, create it
    if(this.creating(name))
      this.create(socket, name);
    else{
      // If the room isn't full, join it
      if(!this.full(name))
        this.join(socket, name);
      else
        socket.emit('stat', 'full'); // Send full message
    }
  }
  else
    socket.emit('stat', '404'); // Send 404 message
};
/* End room request handler */

/* Join a random room */
Rooms.prototype.random = function(socket){
  // Refresh room list
  this.refresh();

  var i = 0;
  var nbRoom = this.rooms.length - 1;
  var choices = []; // List of available rooms (no full, no being created)

  // List all the available rooms
  do{
    if(!this.creating(this.rooms[i]))
      if(!this.full(this.rooms[i]))
        choices.push(this.rooms[i]);
    i++;
  } while(i < nbRoom);

  var nbChoices = choices.length - 1;
  // If no room
  if(nbChoices < 0)
    this.creation(socket);
  else{
    // Join a random room
    var random = this.rooms[this.rand(0, nbChoices)];
    socket.emit('join', random);
  }
};
/* End join a random room */

/* Join room */
Rooms.prototype.join = function(socket, name){
  // Join the room
  socket.join(name);
  // Add the new player to the game
  this.games[name].addPlayer(socket);
};
/* End join room */

/* Room creation */
Rooms.prototype.creation = function(socket){
  // Generate name
  var name = this.getName();
  // Add the room to the roomList
  this.rooms.push(name);
  // Switch socket to the room
  socket.emit('join', name);
};

Rooms.prototype.create = function(socket, name){
  // Join the room
  socket.join(name);
  // Create a new game in the room
  this.games[name] = new Game(this.ws, name);
  // Add the new player to the game
  this.games[name].addPlayer(socket);
};

Rooms.prototype.getName = function(){
  var name = '';
  var length = 8;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++){
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Case if room already exist
  if(this.sRooms.hasOwnProperty(name)){
    this.getName();
    return false;
  }

  return name;
};
/* End room creation */

/* Room status */
Rooms.prototype.creating = function(name){
  // Check if the room is being created
  if(this.games[name])
    return false;
  else
    return true;
};

Rooms.prototype.exist = function(name){
  // Check if the room exist in the list
  if(this.rooms.indexOf(name) != -1)
    return true;
  else
    return false;
};

Rooms.prototype.full = function(name){
  // Check if the room is full
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

/* Refresh room list */
Rooms.prototype.refresh = function(){
  var nbRoom = this.rooms.length - 1;
  var i = 0;
  do{
    if(!this.sRooms[this.rooms[i]]){ // If room !exist in socket.io object
      if(!this.creating(this.rooms[i])){ // If room !is being created
        // Delete the room
        delete this.games[this.rooms[i]];
        this.rooms.splice(i, 1);
        nbRoom--;
      }
    }
    i++;
  } while(i < nbRoom);
};
/* End refresh room list */

/* Route handler */
Rooms.prototype.handleRoute = function(){
  var _this = this;
  this.router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../front/home.html'));
  });
  this.router.get("/game/:game",function(req, res){
    res.sendFile(path.join(__dirname, '../front/game.html'));
  });
  this.router.get("*",function(req, res){
    res.sendFile(path.join(__dirname, '../front/404.html'));
  });
};
/* End route handler */

Rooms.prototype.rand = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
