module.exports = Game;

function Game(ws){
  var _this = this;
  this.ws = ws;
  this.players = {};
  this.obstacle = setTimeout(function(){
    _this.sendObstacle();
  }, 10);
}

Game.prototype.addPlayer = function(player){
  this.players[player.name] = player;
};

Game.prototype.deletePlayer = function(name){
  delete this.players[name];
};

Game.prototype.sendObstacle = function(){
  var _this = this;
  this.ws.emit('obstacle', this.createObstacle());
  this.obstacle = setTimeout(function(){
    _this.sendObstacle();
  }, 1500);
};

Game.prototype.createObstacle = function(){
  var type = this.rand(0, 3);
  var model = {
    type: type
  };
  switch(type){
    case 0 :
      // Middle obst
      model.size = this.rand(30, 85);
    break;
    case 1 :
      // Top or bot passage
      model.position = this.rand(0, 1);
    break;
    case 2 :
      // Flappy type
      model.position = this.rand(15, 70);
    break;
    case 3 :
      // Top or bot, variable size
      model.position = this.rand(0, 1);
      model.size = this.rand(50, 80);
    break;
  };

  return model;
};

Game.prototype.rand = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
