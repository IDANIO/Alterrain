var Client = {};
(function () {

  /**
   * This function should be called when changed to game play State
   */
  Client.connectToServer = function() {
    Client.socket = io.connect();

    Client.socket.on('playerUpdate', function (data) {
      console.log(data);
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
    Client.socket.on('initWorld', function (data) {
      console.log(data);
      var players = data.players;
      for (var i = 0; i < players.length; i++) {
        gameplayState.addNewPlayer(players[i].id, players[i].x, players[i].y)
      }
      if(data.id){
        gameplayState.setPlayerReference(data.id);
      }
      gameplayState.generateTiles(data.tiles);
    });

    /**
     * @param data {Object}
     * @param data.tiles {Array} An array that represents a tile's x,y position and type
     */
    Client.socket.on("worldUpdate", function (data){
      gameplayState.changeTileAt(data.tiles[0], data.tiles[1], data.tiles[2]);
    });

    /**
     * @param data {Object} An object with an x and y property that represents the sound's position
     */
    Client.socket.on("playSound", function (data){
      gameplayState.playAbstractSoundAt(data.x, data.y);
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
    // TODO: Julio, make it only sent the direction for player to move
    // 2 = Down, 4 = Left, 6 = Right, 8 = Up

    var dir = 2;
    if (dx > 0) {
      if (dy === 0) {
        dir = 6;
      }
    } else if (dx < 0) {
      if (dy === 0) {
        dir = 4;
      }
    } else {
      if (dy < 0) {
        dir = 8;
      }
    }

    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    Client.socket.emit("inputCommand", {
      type: 1,
      params: dir
    });

    // Client.socket.emit("moveplayer", {dx: dx, dy: dy});
  }

  /**
   * @deprecated
   */
  Client.changeTile = function () {

    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    Client.socket.emit("inputCommand", {
      type: 2,
      params: {
        tileId: 2 // Rock
      }
    });

    // Client.socket.emit("moveplayer", {tile:true});
  }

  /**
   * @deprecated
   * @param x The x position of the sound's source
   * @param y The y position of the sound's source
   */
  Client.playSound = function(){

    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    Client.socket.emit("inputCommand", {
      type: 3,
      params: null
    });

    //   Client.socket.emit("playSound")
  }

})();

