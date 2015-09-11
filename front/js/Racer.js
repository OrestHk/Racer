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

  // Player emitter
  this.addEmitter(this.player, this.player.data.color);

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
  var player = this.player.el;

  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  this.player.emitter.x = player.position.x;
  this.player.emitter.y = player.position.y + player.height / 2;

  this.player.data.updatePosition(player.position);

  if(this.cursors.up.isDown){
    player.body.velocity.y = -500;
    player.refresh = true;
  }
  if(this.cursors.down.isDown){
    player.body.velocity.y = 500;
    player.refresh = true;
  }
  if(this.cursors.left.isDown){
    player.refresh = true;
    player.body.velocity.x = -500
  }
  if(this.cursors.right.isDown){
    player.refresh = true;
    player.body.velocity.x = 500;
  }
};

Racer.prototype.foesUpdate = function(){
  for(var i = 0; i < this.foes.children.length; i++){
    this.foes.children[i].emitter.x = this.foes.children[i].position.x;
    this.foes.children[i].emitter.y = this.foes.children[i].position.y + this.foes.children[i].height / 2;
  }
};

Racer.prototype.createFoe = function(color, id, pos){
  var foe = this.foes.create(0, 0, this.playerCreator(this.player.data.size, color));
  this.addEmitter(foe, color);
  foe.name = id;
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
      this.foes.children[i].position.x = pos.x;
      this.foes.children[i].position.y = pos.y;
    }
  }
};

Racer.prototype.destroyFoe = function(id){
  for(var i = 0; i < this.foes.children.length; i++){
    if(this.foes.children[i].name == id){
      this.foes.children[i].kill();
      this.foes.children[i].emitter.kill();
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

Racer.prototype.addEmitter = function(parent, color){
  var particle = this.add.bitmapData(8, 8);
  particle.ctx.arc(4, 4, 4, 0, 2 * Math.PI);
  particle.ctx.fillStyle = color;
  particle.ctx.fill();

  parent.emitter = this.add.emitter(0, 0);
  parent.emitter.makeParticles(particle);
  parent.emitter.gravity = 0;
  parent.maxParticles = 300;
  parent.emitter.height = 0; //parent.el.height / 2;
  parent.emitter.minParticleSpeed.x = -0;
  parent.emitter.maxParticleSpeed.x = -500;
  parent.emitter.minParticleSpeed.y = 0;
  parent.emitter.maxParticleSpeed.y = 0;
  parent.emitter.setAlpha(1, 0, 700);
  parent.emitter.setScale(1, 0.9, 1, 0.6, 700);
  parent.emitter.start(false, 700, 1);
};

Racer.prototype.createObstacle = function(model){
  switch(model.type){
    case 0 :
      var size = this.game.height * model.size / 100;
      var obstacle = this.obstacles.create(
        game.width, // X
        (game.height - size) / 2, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -250;
    break;
    case 1 :
      var size = this.game.height * 80 / 100;
      var top = model.position ? 0 : this.game.height - size;
      var obstacle = this.obstacles.create(
        game.width, // X
        top, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -250;
    break;
    case 2 :
      var topSize = this.game.height * model.position / 100;
      var topObstacle = this.obstacles.create(
        game.width, // X
        0, // Y
        this.obstacleCreator(topSize)); // ObstacleBitmapCreator

      topObstacle.body.immovable = true;
      topObstacle.body.velocity.x = -250;

      var botSize = this.game.height * (100 - model.position - 15) / 100;
      var obstacleTop = topSize + (this.game.height * 15 / 100);
      var botObstacle = this.obstacles.create(
        game.width, // X
        obstacleTop, // Y
        this.obstacleCreator(botSize)); // ObstacleBitmapCreator

      botObstacle.body.immovable = true;
      botObstacle.body.velocity.x = -250;
    break;
    case 3 :
      var size = this.game.height * model.size / 100;
      var top = model.position ? 0 : this.game.height - size;
      var obstacle = this.obstacles.create(
        game.width, // X
        top, // Y
        this.obstacleCreator(size)); // ObstacleBitmapCreator

      obstacle.body.immovable = true;
      obstacle.body.velocity.x = -250;
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
