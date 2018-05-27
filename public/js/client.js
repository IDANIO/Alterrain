var Client = {};
(function () {

  /**
   * This function should be called when changed to game play State
   */
  Client.connectToServer = function() {
    Client.socket = io.connect();

    /**
     * @param data {Object}
     * @param data.id {Number} Player Id
     * @param data.x {Number} The new x position
     * @param data.y {Number} The new y position
     * @param data.d {Number} The new direction
     */
    Client.socket.on('playerUpdate', function (data) {
      gameplayState.movePlayer(data.id, data.x, data.y, data.d);
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
     * @param data.tiles {Array} A 2D array of the world data.
     * @param data.solidObjects {Array} A 2D array of the solid objects in the world.
     * @param data.chests {Array} A 1D array of the treasure chests in the world.
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
      //-Ivan's change -------------------------------------------------------//
      data.solidObjects.forEach(function (tree) {
        gameplayState.placeSolidObject(0, tree.x, tree.y, tree.durability);
      });

      //-Original-------------------------------------------------------------//
      // gameplayState.generateSolidObjects(data.solidObjects);
      //----------------------------------------------------------------------//

      console.log("Printing data.chests");
      console.log(data.chests);
      gameplayState.spawnTreasureChests(data.chests);
    });

    /**
     * @param data {Object}
     * @param data.tiles {Array} An array that represents a tile's x,y position and type
     */
    Client.socket.on('worldUpdate', function (data){
      // Server has returned an array of changed tiles.
      //
      for (var i = 0; i < data.tiles.length; i++) {
        var tile = data.tiles[i];
        var x = tile[0];
        var y = tile[1];
        var type = tile[2];
        gameplayState.changeTileAt(x, y, type);
        //gameplayState.playAbstractSoundAt(x, y);
      }
    });

    /**
     * @param data {Object} An object with the id of the player who made the sound
     */
    Client.socket.on('playSound', function (data){
      gameplayState.playAbstractSoundFrom(data.id);
    });

    /**
     * @param data {Object} An object with the x and y index of the chest and its state
     */
    Client.socket.on("chestUpdate", function (data){
      gameplayState.interactWithChest(data.x, data.y, data.state);
    });
    
    /**
     * @param data {Object}
     * @param data.id {Number} The player's ID
     * @param data.inventory {Array} The player's inventory
     */
    Client.socket.on("inventoryUpdate", function (data){
      gameplayState.updatePlayerInventory(data.id, data.inventory);
    });
    
    /**
     * @param data {Object}
     * @param data.x {Number} The tree's x position in tiles
     * @param data.y {Number} The tree's y position in tiles
     * @param data.durability {Number} The tree's remaining hitpoints
     */
    Client.socket.on("treeCut", function (data){
      gameplayState.cutTree(data.x, data.y, data.durability);
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
   * @param dir
   */
  Client.sendMove = function (dir) {
    // TODO: Julio, make it only sent the direction for player to move
    // 2 = Down, 4 = Left, 6 = Right, 8 = Up

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
  };

  Client.changeTile = function (tileChoice, dir) {
    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    //   INTERACT: 4,
    Client.socket.emit('inputCommand', {
      type: 2,
      params: {
        tileId: tileChoice,
        // direction: dir
      }
    });
  };

  Client.interact = function () {

    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    //   INTERACT: 4,
    Client.socket.emit("inputCommand", {
      type: 4
    });
  };

  Client.playSound = function(){

    // check '/shared/constant.js'
    //
    //   MOVEMENT: 1,
    //   ALTER_TILE: 2,
    //   COMMUNICATION: 3,
    Client.socket.emit("inputCommand", {
      type: 3,
    });
  }

})();

