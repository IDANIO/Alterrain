var Client = {};
(function () {

  /**
   * This function should be called when changed to game play State
   */
  Client.connectToServer = function() {
    Client.socket = io.connect();

    Client.socket.on('disconnect', function () {
      game.state.start("MainMenuState");
    });


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
        //console.log('removing player ' + event.playerId);
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
     * @param data.weather {Number} The current weather of the world
     */
    Client.socket.on('initWorld', function (data) {
      // Parse Players
      let each = data.players.split('|');
      for (let i = 0; i < each.length - 1; i++) {
        let e = each[i].split(' ');

        let id = parseInt(e[0]);
        let x = parseFloat(e[1]);
        let y = parseFloat(e[2]);
        let d = parseInt(e[3]);

        gameplayState.addNewPlayer(id, x, y)
      }

      if(data.id){
        gameplayState.setPlayerReference(data.id);
      }


      // Parse Tiles
      let tileStrings = data.tiles.split(' ');

      let w = parseInt(tileStrings[0]);
      let h = parseInt(tileStrings[1]);

      let index = 2;

      let tiles = [];
      for (let i = 0; i < w; i++) {
        tiles[i] = [];
        for (let j = 0; j < h; j++) {
          tiles[i][j] = parseInt(tileStrings[index++]);
        }
      }

      gameplayState.generateTiles(tiles);


      // parse trees
      let trees = data.trees.split('|');
      for (let i = 0; i < trees.length - 1; i++) {
        let e = trees[i].split(' ');

        let x = parseInt(e[0]);
        let y = parseInt(e[1]);
        let durability = parseInt(e[2]);

        gameplayState.placeSolidObject(0, x, y, durability);
      }

      // parse chests
      let chests = data.chests.split('|');
      let chestArr = [];
      for (let i = 0; i < chests.length - 1; i++) {
        let e = chests[i].split(' ');

        let x = parseInt(e[0]);
        let y = parseInt(e[1]);
        let state = parseInt(e[2]);
        let playerRequired = parseInt(e[3]);

        chestArr.push({x: x, y: y, playerRequired: playerRequired, state:state });
      }


      gameplayState.spawnTreasureChests(chestArr);

      gameplayState.startWeatherEffect(data.weather);
    });

    //----------------------------------------------------------------------//
    Client.socket.on('update', function (arr) {
      arr.forEach(function (data) {
        let each = data.d.split('|');
        for (let i = 0; i < each.length - 1; i++) {
          let e = each[i].split(' ');

          let id = parseInt(e[0]);
          let x = parseFloat(e[1]);
          let y = parseFloat(e[2]);
          let d = parseInt(e[3]);

          gameplayState.updatePlayerPos(id, x, y, d);
        }
      });
    });
    //----------------------------------------------------------------------//

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
    Client.socket.on('chestUpdate', function (data){
      gameplayState.interactWithChest(data.x, data.y, data.state, data.playerRequired, data.success);
    });

    /**
     * data is an Array of Objects {x, y, durability}
     */
    Client.socket.on('objectUpdate', function (data) {
      console.log('New trees are spawned..');
      data.forEach(function (obj) {
        gameplayState.placeSolidObject(0, obj.x, obj.y, obj.durability);
      });
    });

    Client.socket.on('objectRemoval', function (data) {
      gameplayState.deleteObjectAt(data.x, data.y);
    });

    /**
     * @param data {Object}
     * @param data.id {Number} The player's ID
     * @param data.inventory {Array} The player's inventory
     */
    Client.socket.on('inventoryUpdate', function (data){
      gameplayState.updatePlayerInventory(data.id, data.inventory);
    });

    /**
     * @param data {Object}
     * @param data.id {Number} The player's ID
     */
    Client.socket.on("errorSound", function (data){
      gameplayState.playErrorSound(data.id);
    });

    /**
     * @param data {Object}
     * @param data.x {Number} The tree's x position in tiles
     * @param data.y {Number} The tree's y position in tiles
     * @param data.durability {Number} The tree's remaining hitpoints
     */
    Client.socket.on('treeCut', function (data){
      gameplayState.cutTree(data.x, data.y, data.durability);
    });

    /**
     * @param data {Number} The weather type
     */
    Client.socket.on('weatherChange', function (data){
      gameplayState.startWeatherEffect(data);
    });

    /**
     * @param data {Array}
     */
    Client.socket.on('spawnChests', function (data) {
      gameplayState.spawnTreasureChests(data);
    });
  };

  Client.disconnectFromServer = function(){
    Client.socket.disconnect();
  };

  Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    console.log('newPlayer')
  };

  // Client.inputThreshold = 15;
  Client.sendInputs = function (dir) {

    // Only send if moved.
    if  (dir === 0) {
      return;
    }

    //console.log('send');

    Client.socket.emit('inputCommand', {
      type: 1, // MOVEMENT
      params: dir
    });
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

