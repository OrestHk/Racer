var socket, player, game;
$(document).ready(function(){
  socket = io.connect('http://localhost:145/');
  initGame();
});

function initGame(){
  socket.on('handshake', function(data){
    player = new Player(data.color, data.id, socket);
    game = new Phaser.Game(800, 500, Phaser.AUTO, 'racer');
    game.state.add('racer', Racer, false);
    game.state.start('racer', true, false, player);
    socket.emit('handshake');
  });
}
