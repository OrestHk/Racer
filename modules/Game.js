var Player    = require(__root + 'modules/Player.js');

module.exports = Game;

function Game(ws, room){
  var _this = this;
  this.ws = ws; // Socket.io object
  this.room = room; // Room name
  this.players = {}; // List of players
  this.countdownTimer; // Countdown timeout
  this.stat = { // Game stats
    ready: false,
    start: false,
  };
}

/* Player handler */
Game.prototype.addPlayer = function(socket){
  // Add player to the list of players
  this.players[socket.id] = new Player(socket, this.room, this);
  // If countdown isn't launch, check for ready state
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
  // If more than 1 player in the game, launch the countdown
  if(this.countPlayer() > 1)
    this.countdown();
};

Game.prototype.countdown = function(){
  var _this = this;
  var count = 5;

  // Toggle the ready state, disable multiple countdown launch
  this.stat.ready = true;

  // Launch the countdown
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

/* Game over */
Game.prototype.gameOver = function(){
  var player, count = 0, dead = 0;
  // Count dead players
  for(player in this.players){
    if(!this.players[player].spectator){
      count++;
      if(!this.players[player].alive)
        dead++;
    }
  }

  // If more than 2 are dead, restart game
  if(dead > count - 2)
    this.restart();

};
/* End game over */

/* Restart game */
Game.prototype.restart = function(){
  var player;
  // Reset all players
  for(player in this.players){
    this.players[player].reset();
  }

  clearInterval(this.countdownTimer);
  clearTimeout(this.obstacle);
  this.stat.start = false;
  this.stat.ready = false;
  this.ready();
};
/* End restart game */

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
