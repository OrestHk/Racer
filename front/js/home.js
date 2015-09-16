$(document).ready(function(){
  bindControllers();
  socketHandler();
});

function socketHandler(){
  socket.on('join', function(room){
    window.location.href = '/game/'+room;
  });
}

function bindControllers(){
  $(".create").click(function(){
    socket.emit('createGame');
  });
  $(".join").click(function(){
    socket.emit('joinGame');
  });
  $(".find").click(function(){
    socket.emit('findGame');
  });
}
