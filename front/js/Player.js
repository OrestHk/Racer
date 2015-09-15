function Player(color, id, socket){
  this.id = id;
  this.socket = socket;
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

Player.prototype.destroyed = function(){
  this.socket.emit('destroyed');
};

Player.prototype.socketHandler = function(){
  var _this = this;

  // Foes handler
  this.socket.on('newPlayer', function(data){
    _this.game.createFoe(data.color, data.id);
  });
  this.socket.on('givePos', function(data){
    _this.game.updateFoe(data.pos, data.id);
  });
  this.socket.on('destroy', function(id){
    _this.game.destroyFoe(id);
  });

  // Obstacles handler
  this.socket.on('obstacle', function(model){
    _this.game.createObstacle(model);
  });
};
