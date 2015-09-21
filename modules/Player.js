module.exports = Player;

function Player(socket, room, game){
  this.game = game; // Game object
  this.socket = socket; // Socket object
  this.room = room; // Room name
  this.players = game.players; // Players in the game

  this.name = socket.id; // Player name
  this.color = this.setColor(); // Player color
  this.position = { // Player position
    x: 0,
    y: 0
  };
  this.alive = true;
  this.playing = false; // Player can play or spectate if game is in progress
  this.socketHandler();

  if(!this.game.stat.start)
    this.createPlayer();
}

Player.prototype.socketHandler = function(){
  console.log(this.name+': connected');
  var _this = this;

  // Player position change
  this.socket.on('setPos', function(pos){
    _this.position = {
      x: pos.x,
      y: pos.y
    };
    // Broadcast player's new position to other players
    _this.socket.broadcast.to(_this.room).emit('givePos', {'pos': pos, 'name': _this.name});
  });

  // Broadcast player's death to other players
  this.socket.on('destroy', function(name){
    _this.alive = false;
    _this.socket.broadcast.to(_this.room).emit('destroy', name);
  });

  // Player disconnection
  this.socket.on('disconnect', function(){
    console.log('socket :'+_this.name+' left');
    // If player is alive and is playing make the destroy animation
    if(_this.playing && _this.alive)
      _this.socket.broadcast.to(_this.room).emit('destroy', _this.name);
    // Remove player from player list in game object
    _this.game.deletePlayer(_this.name);
  });
};

Player.prototype.createPlayer = function(){
  var _this = this;
  // Initiate player
  // Handshake allowing to initiate player appearance
  this.socket.emit('handshake', {'color': this.color, 'name': this.name});
  // Handshake allowing to draw player and his opponents
  this.socket.on('handshake', function(){
    _this.playing = true;
    // Draw the new player for his opponents
    _this.socket.broadcast.to(_this.room).emit('newPlayer', {'color': _this.color, 'name': _this.name});
    // Draw opponents for the new player
    for(var player in _this.players){
      if(_this.players[player].name != _this.name){
        _this.socket.emit('newPlayer', {'color': _this.players[player].color, 'name': _this.players[player].name});
      }
    }
  });
};

Player.prototype.setColor = function(){
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for(var i = 0; i < 6; i++){
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
