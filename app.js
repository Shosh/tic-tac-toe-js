var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.use(express.static(__dirname));
app.use(express.static('node_modules'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var players = [];
var letters = ['X', 'O'];

io.sockets.on('connection', function (socket) {
  var player = {
    id: socket.id
  };
  players.push(player);

  socket.emit('setPlayer', { letter: letters[players.length % 2] });

  if (players.length == 2) {
    socket.emit('roomReady', { onTurn: "X" });
  } else {
    console.log(players.length);
  }

  socket.on('makeMove', function (data) {
    var otherPlayer = "X";
    if (data.player == "X") {
      otherPlayer = "O";
    }

    socket.broadcast.emit('finishMove', { player: data.player, position: data.position, onTurn: otherPlayer });
  });

  socket.on('newGame', function (data) {
    socket.broadcast.emit('launchNewGame', { onTurn: data.player });
  });

});
