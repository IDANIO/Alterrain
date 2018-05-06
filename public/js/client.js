var Client = {};
(function () {

  /**
   * This function should be called when changed to game play State
   */
  Client.connectToServer = function() {
    Client.socket = io.connect();

    Client.socket.on("playerMovement", function (data) {
      gameplayState.movePlayer(data.id, data.x, data.y);
    });
    /**
     * @param event {Object}
     * @param event.playerId {Number} UUID assigned to player
     * @param event.x {Number}
     * @param event.y {Number}
     */
    Client.socket.on('playerEvent', function (event) {
      // if Some player left the game
      if (event.disconnectTime) {
        gameplayState.removePlayer(event.playerId);
      } else {
        gameplayState.addNewPlayer(event.playerId, event.x, event.y);
      }
    });

    /**
     * @param data {Object}
     * @param data.players {Array} An array containing all players' x,y coordinate
     * @param data.tiles {Array} An 2D array of the world data.
     */
    Client.socket.on("initWorld", function (data) {
      console.log(data);
      var players = data.players;
      for (var i = 0; i < players.length; i++) {
        gameplayState.addNewPlayer(players[i].id, players[i].x, players[i].y)
      }

      gameplayState.generateTiles(data.tiles);
    });
  };

  /**
   *
   */
  Client.disconnectFromServer = function(){
    Client.socket.disconnect();
  };

  Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    console.log('newPlayer')
  };

  /**
   * @deprecated
   * @param dx
   * @param dy
   */
  Client.sendMove = function (dx, dy) {
    Client.socket.emit("moveplayer", {dx: dx, dy: dy});
  }

})();

