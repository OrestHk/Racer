var player, game;
$(document).ready(function(){
  initGame();
});

function initGame(){
  // "I want to play" told the user to the serv
  var room = window.location.href.split('/game/')[1];
  socket.emit('requireGame', room);

  // Socket handshake with server
  socket.on('handshake', function(data){
    // Player creation
    player = new Player(data.color, data.id, socket);
    // Game creation
    game = new Phaser.Game(800, 500, Phaser.AUTO, 'racer');
    // Transfer game creation to custom object
    game.state.add('racer', Racer, false);
    game.state.start('racer', true, false, player);
    // End transfer
    socket.emit('handshake');
  });
}
