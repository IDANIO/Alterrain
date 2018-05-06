//Create a socket between the client and the server
var Client = {};
Client.socket = io.connect();

//Whenever a player connects, emit the signal "newplayer"
Client.askNewPlayer = function(){
    Client.socket.emit("newplayer");
}

//Whenever the player wants to move, emit the "moveplayer" signal
Client.sendMove = function(dx, dy){
    Client.socket.emit("moveplayer", {dx: dx, dy: dy});
}

//Callback function whenever a "newplayer" signal is received
Client.socket.on("newplayer", function(data){
    console.log("client on newplayer");
    gameplayState.addNewPlayer(data.id, data.x, data.y);
});

//Callback function whenever an "allplayers" signal is received
Client.socket.on("allplayers", function(data){
    for(let i = 0; i < data.length; i++){
        gameplayState.addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});

//Callback function whenever a "remove" signal is received
Client.socket.on("remove", function(id){
    gameplayState.removePlayer(id);
});

//Callback function when the tileMap 2D array is received
Client.socket.on("tilemap", function(tilemap){
    gameplayState.generateTiles(tilemap);
});

//Callback function whenever a "moveplayer" signal is received
Client.socket.on("moveplayer", function(data){
    gameplayState.movePlayer(data.id, data.x, data.y);
});
