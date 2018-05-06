//The main menu state
var GameplayState = function(game){
    //Create a playerMap property
    this.playerMap = {};
};

//Tile-based movement
var playerSpeed = 32;

GameplayState.prototype = {
    init: function(){
      // --------------------------------------
      Client.connectToServer();
      // --------------------------------------
    },

    preload: function(){
        //empty
    },

    create: function(){
        game.stage.backgroundColor = "#222";

        this.tileGroup = game.add.group();


        //Handle input
        game.input.keyboard.onDownCallback = this.handleKeys;
    },

    shutdown: function(){
        // --------------------------------------
        Client.disconnectFromServer();
        // --------------------------------------

    },

    update: function(){
        //empty
    },

    //Adds a new player object to the world
    addNewPlayer: function(id, x, y){
        this.playerMap[id] = game.add.sprite(x, y, "player");
    },

    //Removes a player object from the world with the given id
    removePlayer: function(id){
        this.playerMap[id].destroy();
        delete this.playerMap[id];
    },

    handleKeys: function(e){
        if(e.keyCode == Phaser.Keyboard.UP){
            Client.sendMove(0, -playerSpeed);
        }
        if(e.keyCode == Phaser.Keyboard.DOWN){
            Client.sendMove(0, playerSpeed);
        }
        if(e.keyCode == Phaser.Keyboard.LEFT){
            Client.sendMove(-playerSpeed, 0);
        }
        if(e.keyCode == Phaser.Keyboard.RIGHT){
            Client.sendMove(playerSpeed, 0);
        }
        //Quit key - go back to the main menu
        if(e.keyCode == Phaser.Keyboard.ESC){
            game.state.start("MainMenuState");
        }
    },

    //Moves the player to the given position
    movePlayer: function(id, x, y){
        this.playerMap[id].x = x;
        this.playerMap[id].y = y;
    },

    //Generates tile objects based on a given 2D tilemap
    //0 == grass
    //1 == sand
    generateTiles: function(tileMap){
        for(let i = 0; i < tileMap.length; i++){
            for(let j = 0; j < tileMap[i].length; j++){
                if(tileMap[i][j] === 0){ //grass
                    let tile = this.tileGroup.create(i * 32, j * 32, "grassTile");
                    tile.scale.x = 2;
                    tile.scale.y = 2;
                }
                else if(tileMap[i][j] === 1){ //sand
                    let tile = this.tileGroup.create(i * 32, j * 32, "sandTile");
                    tile.scale.x = 2;
                    tile.scale.y = 2;
                }
            }
        }
    }
}

