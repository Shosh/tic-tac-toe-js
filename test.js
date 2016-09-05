(function () {
  var socket = io.connect('http://localhost:3000');
  var symbol = "";
  var onTurn = false;

  var isAvailable = function (cellId) {
    var elem = document.getElementById(cellId);
    if (elem.innerText != "") {
      return false;
    }
    return true;
  };

  var newGame = function (winner) {
    for (i = 1; i <= 9; i++) {
      document.getElementById(i).innerText = "";
    }
    onTurn = symbol !== winner;
  };

  socket.on('launchNewGame', function (data) {
    newGame(data.onTurn);
  });

  socket.on('setPlayer', function (data) {
    console.log("player set: ", data.letter);
    symbol = data.letter;
    document.getElementById("player").innerText += symbol;
  });

  socket.on('roomReady', function (data) {
    onTurn = data.onTurn === symbol;
  });

  socket.on('finishMove', function (data) {
    document.getElementById(data.position).innerText = data.player;
    onTurn = data.onTurn === symbol;
  });

  var allLike = function (list, symbol) {
    var symbols = [];
    list.forEach(function (s) {
      var currentSymbol = document.getElementById(s).innerHTML;
      if (currentSymbol !== "" && currentSymbol === symbol) {
        symbols.push(currentSymbol);
      }
    });
    if (symbols.length === 3) {
      return true;
    }
    else {
      return false;
    }
  };

  var isWinner = function (playerSymbol) {
    var winningRows = [[1, 2, 3], [4, 5, 6], [7, 8, 9],
      [1, 4, 7], [2, 5, 8], [3, 6, 9],
      [1, 5, 9], [3, 5, 7]];
    winningRows.forEach(function (row) {
      var winner = allLike(row, playerSymbol);
      if (winner) {
        alert("winner is:" + playerSymbol);
        socket.emit("newGame", { player: playerSymbol });
        newGame(playerSymbol);
      };
    });
  };

  $('td').click(function (eventData) {
    if (onTurn && isAvailable(eventData.target.id)) {
      socket.emit('makeMove', { player: symbol, position: eventData.target.id });
      document.getElementById(eventData.target.id).innerText = symbol;
      isWinner(symbol);
      onTurn = false;
    }
    return false;
  });

})();
