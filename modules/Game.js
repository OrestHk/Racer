module.exports = Game;

function Game(ws, room){
  var _this = this;
  this.ws = ws;
  this.room = room;
  this.players = {};
  this.countdownTimer;
  this.stat = {
    ready: false,
    start: false,
  };
}

/* Player handler */
Game.prototype.addPlayer = function(player){
  this.players[player.name] = player;
  if(!this.stat.ready)
    this.ready();
};

Game.prototype.deletePlayer = function(name){
  delete this.players[name];
};

Game.prototype.countPlayer = function(){
  var count = 0, player;
  for(player in this.players){
    if(this.players.hasOwnProperty(player))
      count++;
  }

  return count;
};
/* End player handler */

/* Game launchers */
Game.prototype.ready = function(){
  var _this = this;
  if(this.countPlayer() > 1)
    this.countdown();
};
Game.prototype.countdown = function(){
  var _this = this;
  var count = 5;

  this.stat.ready = true;

  this.countdownTimer = setInterval(function(){
    if(count < 0){
      clearInterval(_this.countdownTimer);
      _this.stat.start = true;
      _this.sendObstacle();
    }
    _this.ws.to(_this.room).emit('countdown', count);
    count--;
  }, 1000);
};
/* End game launchers */

/* Obstale handler */
Game.prototype.sendObstacle = function(){
  var _this = this;
  this.ws.to(this.room).emit('obstacle', this.createObstacle());
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
/* End obstacle handler */

Game.prototype.rand = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
