// //Create a socket between the client and the server
// var Client = {};
// Client.socket = io.connect();
//
// //Whenever a player connects, emit the signal "newplayer"
// Client.askNewPlayer = function(){
//     Client.socket.emit("newplayer");
// }
//
// //Whenever the player wants to move, emit the "moveplayer" signal
// Client.sendMove = function(dx, dy){
//     Client.socket.emit("moveplayer", {dx: dx, dy: dy});
// }
//
// //Callback function whenever a "newplayer" signal is received
// Client.socket.on("newplayer", function(data){
//     console.log("client on newplayer");
//     gameplayState.addNewPlayer(data.id, data.x, data.y);
// });
//
// //Callback function whenever an "allplayers" signal is received
// Client.socket.on("allplayers", function(data){
//     for(let i = 0; i < data.length; i++){
//         gameplayState.addNewPlayer(data[i].id, data[i].x, data[i].y);
//     }
// });
//
// //Callback function whenever a "remove" signal is received
// Client.socket.on("remove", function(id){
//     gameplayState.removePlayer(id);
// });
//
// //Callback function whenever a "moveplayer" signal is received
// Client.socket.on("moveplayer", function(data){
//     gameplayState.movePlayer(data.id, data.x, data.y);
// });

var Client = {};
(function () {

  Client.socket = io.connect();

  Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    console.log('newPlayer')
  }

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
  })

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

  /**
   * @deprecated
   * @param dx
   * @param dy
   */
  Client.sendMove = function (dx, dy) {
    Client.socket.emit("moveplayer", {dx: dx, dy: dy});
  }

  Client.socket.on("playerMovement", function (data) {
    gameplayState.movePlayer(data.id, data.x, data.y);
  });
})();

