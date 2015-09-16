module.exports = Player;

function Player(socket, room, game){
  this.room = room;
  this.game = game;
  this.socket = socket;
  this.name = socket.id;
  this.players = game.players;
  this.color = this.setColor();
  this.position = {
    x: 0,
    y: 0
  };
  this.alive = true;
  this.socketHandler();
}

Player.prototype.socketHandler = function(){
  console.log(this.name+': connected');
  var _this = this;

  // Initiate player
  this.socket.emit('handshake', {'color': this.color, 'id': this.name});
  this.socket.on('handshake', function(){
    _this.socket.broadcast.to(_this.room).emit('newPlayer', {'color': _this.color, 'id': _this.name});
    for(var player in _this.players){
      if(_this.players[player].name != _this.name){
        _this.socket.emit('newPlayer', {'color': _this.players[player].color, 'id': _this.players[player].name});
      }
    }
  });

  // Player position change
  this.socket.on('setPos', function(pos){
    _this.position = {
      x: pos.x,
      y: pos.y
    };
    _this.socket.broadcast.to(_this.room).emit('givePos', {'pos': pos, 'id': _this.name});
  });

  // Player disconnection
  this.socket.on('disconnect', function(){
    _this.socket.broadcast.to(_this.room).emit('destroy', _this.name);
    _this.game.deletePlayer(_this.name);
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
