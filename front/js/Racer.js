function Racer(game){
}

Racer.prototype.init = function(player){
  this.player = {
    data: player,
    el: null,
  };
  this.player.data.link(this);
};

Racer.prototype.preload = function(){

};

Racer.prototype.create = function(){
  // Set physiscs
  this.physics.startSystem(Phaser.Physics.ARCADE);

  // Disable game pause
  this.stage.disableVisibilityChange = true;

  // Foes group
  this.foes = this.add.group();
  this.physics.arcade.enable(this.foes);
  this.foes.enableBody = true;

  // Obstacles group
  this.obstacles = this.add.group();
  this.physics.arcade.enable(this.obstacles);
  this.obstacles.enableBody = true;

  // Player creation
  this.player.el = this.add.sprite(
    this.centerX, // X
    this.centerY, // Y
    this.playerCreator(this.player.data.size, this.player.data.color)); // BitmapModelCreator
  var player = this.player.el;

  // Player trail
  this.addTrail(this.player.el, this.player.data.color);

  this.physics.arcade.enable(player);
  player.enableBody = true;
  player.body.collideWorldBounds = true;
  player.refresh = false; // bool if player pos need to be updated

  // Player update position
  this.player.data.updatePosition(player.position);

  // Key binding
  this.cursors = this.input.keyboard.createCursorKeys();
};

Racer.prototype.update = function(){
  this.playerUpdate();
  this.foesUpdate();
};

Racer.prototype.playerUpdate = function(){
  var _this = this;
  var player = this.player.el;

  // Player's elements collisions
  this.physics.arcade.collide(this.obstacles, player, function(){
    _this.destroyPlayer(_this.player.el, _this.player.data.color);
  });
  if(player.explosion)
    this.physics.arcade.collide(this.obstacles, player.explosion);
  if(player.trail)
    this.physics.arcade.collide(this.obstacles, player.trail);

  // Player reset position
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  player.trail.x = player.position.x;
  player.trail.y = player.position.y + player.height / 2;

  // Player update position
  this.player.data.updatePosition(player.position);

  // Player direction handler
  if(this.cursors.up.isDown){
    player.body.velocity.y = -400;
    player.refresh = true;
  }
  if(this.cursors.down.isDown){
    player.body.velocity.y = 400;
    player.refresh = true;
  }
  if(this.cursors.left.isDown){
    player.refresh = true;
    player.body.velocity.x = -400
  }
  if(this.cursors.right.isDown){
    player.refresh = true;
    player.body.velocity.x = 400;
  }
};

Racer.prototype.foesUpdate = function(){
  var _this = this;
  // Update foes position
  for(var i = 0; i < this.foes.children.length; i++){
    var foe = this.foes.children[i];
    foe.trail.x = foe.position.x;
    foe.trail.y = foe.position.y + foe.height / 2;
    // Foes collisions
    this.physics.arcade.collide(this.obstacles, foe, function(){
      _this.destroyPlayer(foe, foe.color);
    });
    if(foe.explosion)
      this.physics.arcade.collide(this.obstacles, foe.explosion);
    if(foe.trail)
      this.physics.arcade.collide(this.obstacles, foe.trail);
  }
};

Racer.prototype.createFoe = function(color, id, pos){
  var foe = this.foes.create(0, 0, this.playerCreator(this.player.data.size, color));
  this.addTrail(foe, color);
  foe.name = id;
  foe.color = color;
  if(!pos){
    foe.position.x = 0;
    foe.position.y = 0;
  }
  else{
    foe.position.x = pos.x;
    foe.position.y = pos.y;
  }
};

Racer.prototype.updateFoe = function(pos, id){
  for(var i = 0; i < this.foes.children.length; i++){
    if(this.foes.children[i].name == id){
      this.foes.children[i].x = pos.x;
      this.foes.children[i].y = pos.y;
    }
  }
};

Racer.prototype.destroyFoe = function(id){
  for(var i = 0; i < this.foes.children.length; i++){
    if(this.foes.children[i].name == id){
      this.foes.children[i].trail.kill();
      this.foes.children[i].kill();
    }
  }
};

Racer.prototype.playerCreator = function(size, color){
  var player = this.add.bitmapData(size.width, size.height);
  player.ctx.beginPath();
  player.ctx.rect(0, 0, size.width, size.height);
  player.ctx.fillStyle = color;
  player.ctx.fill();

  return player;
};

Racer.prototype.destroyPlayer = function(player, color){
  this.createExplosion(player, color);
  player.kill();
  player.trail.kill();
};

Racer.prototype.createExplosion = function(player, color){
  var particle = this.add.bitmapData(10, 10);
  particle.ctx.beginPath();
  particle.ctx.moveTo(0, 0);
  particle.ctx.lineTo(10, 0);
  particle.ctx.lineTo(5, 10);
  particle.ctx.closePath();
  particle.ctx.fillStyle = color;
  particle.ctx.fill();

  player.explosion = this.add.emitter(0, 0);
  player.explosion.makeParticles(particle);
  player.maxParticles = 500;
  player.explosion.gravity = 0;
  player.explosion.height = player.height;
  player.explosion.width = player.width;
  player.explosion.x = player.x + player.height / 2;
  player.explosion.y = player.y + player.width / 2;
  player.explosion.setAlpha(1, 0, 2000);
  player.explosion.setScale(1, 0.2, 1, 0.3, 2000);
  player.explosion.setXSpeed(-200, 200);
  player.explosion.setYSpeed(-200, 200);
  player.explosion.bounce.setTo(1, 1);
  player.explosion.flow(2000, 1, 500, 1);
};

Racer.prototype.addTrail = function(parent, color){
  var particle = this.add.bitmapData(8, 8);
  particle.ctx.arc(4, 4, 4, 0, 2 * Math.PI);
  particle.ctx.fillStyle = color;
  particle.ctx.fill();

  parent.trail = this.add.emitter(0, 0);
  parent.trail.makeParticles(particle);
  parent.trail.gravity = 0;
  parent.maxParticles = 300;
  parent.trail.height = 0;
  parent.trail.minParticleSpeed.x = -0;
  parent.trail.maxParticleSpeed.x = -500;
  parent.trail.minParticleSpeed.y = 0;
  parent.trail.maxParticleSpeed.y = 0;
  parent.trail.setAlpha(1, 0, 700);
  parent.trail.setScale(1, 0.9, 1, 0.6, 700);
  parent.trail.start(false, 700, 1);
};

Racer.prototype.createObstacle = function(model){
  var obstacleVelocity = 200;
  switch(model.type){
    case 0 :
      var size = this.game.height * model.size / 100;
      var obstacle = this.obstacles.create(
        game.width, // X
        (game.height - size) / 2, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -obstacleVelocity;
    break;
    case 1 :
      var size = this.game.height * 80 / 100;
      var top = model.position ? 0 : this.game.height - size;
      var obstacle = this.obstacles.create(
        game.width, // X
        top, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -obstacleVelocity;
    break;
    case 2 :
      var topSize = this.game.height * model.position / 100;
      var topObstacle = this.obstacles.create(
        game.width, // X
        0, // Y
        this.obstacleCreator(topSize)); // ObstacleBitmapCreator

      topObstacle.body.immovable = true;
      topObstacle.body.velocity.x = -obstacleVelocity;

      var botSize = this.game.height * (100 - model.position - 15) / 100;
      var obstacleTop = topSize + (this.game.height * 15 / 100);
      var botObstacle = this.obstacles.create(
        game.width, // X
        obstacleTop, // Y
        this.obstacleCreator(botSize)); // ObstacleBitmapCreator

      botObstacle.body.immovable = true;
      botObstacle.body.velocity.x = -obstacleVelocity;
    break;
    case 3 :
      var size = this.game.height * model.size / 100;
      var top = model.position ? 0 : this.game.height - size;
      var obstacle = this.obstacles.create(
        game.width, // X
        top, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -obstacleVelocity;
    break;
  };
};

Racer.prototype.obstacleCreator = function(height){
  var width = this.player.data.size.width;
  var obstacle = this.add.bitmapData(width, height);
  obstacle.ctx.beginPath();
  obstacle.ctx.rect(0, 0, width, height);
  obstacle.ctx.fillStyle = '#ffffff';
  obstacle.ctx.fill();

  return obstacle;
};

Racer.prototype.rand = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
