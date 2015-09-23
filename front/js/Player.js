function Player(color, name, spectator, socket){
  this.name = name;
  this.socket = socket;
  this.spectator = spectator;
  this.color = color;
  this.size = {
    height: 20,
    width: 20
  };
}

Player.prototype.link = function(game){
  this.game = game;
  this.socketHandler();
};

Player.prototype.updatePosition = function(position){
  this.socket.emit('setPos', position);
};

Player.prototype.destroy = function(name){
  this.socket.emit('destroy', name);
};

Player.prototype.socketHandler = function(){
  var _this = this;

  // Foes handler
  this.socket.on('newPlayer', function(data){
    _this.game.createFoe(data.color, data.name, data.alive);
  });
  this.socket.on('givePos', function(data){
    _this.game.updateFoe(data.pos, data.name);
  });
  this.socket.on('destroy', function(name){
    _this.game.destroyFoe(name);
  });

  // Obstacles handler
  this.socket.on('obstacle', function(model){
    _this.game.createObstacle(model);
  });
};
