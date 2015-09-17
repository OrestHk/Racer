var player, game;
$(document).ready(function(){
  initGame();
});

function initGame(){
  // "I want to play" told the user to the serv
  var room = window.location.href.split('/game/')[1];
  socket.emit('requireGame', room);

  // Room stat handler
  socket.on('stat', function(stat){
    switch(stat){
      case 'full' :
        $("body").append('<p>Full</p>');
      break;
      case '404' :
        $("body").append('<p>404</p>');
      break;
    };
  });

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
