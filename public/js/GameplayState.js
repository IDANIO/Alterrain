//The main menu state
var GameplayState = function(game){
    //Create a playerMap property
    this.playerMap = {};
    this.player = null;
};

//Tile-based movement
var playerSpeed = 16;

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
        //TODO use constants instead of hard-coded numbers
        game.world.setBounds(0, 0, 64 * 16, 64 * 16);

        this.tileGroup = game.add.group();
        
        this.tileMap = game.add.tilemap();
        this.tileMap.setTileSize(16, 16);
        this.tileMap.addTilesetImage("gameTileset");
        //new Tilemap(layerName, widthInTiles, heightInTiles, tileWidth, tileHeight)
        this.mainLayer = this.tileMap.create("mainLayer", 64, 64, 16, 16);

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

    //Set the player reference to the correct player sprite object
    setPlayerReference: function(id){
        this.player = this.playerMap[id];
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
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
        //Change the tile the player is standing on
        //TODO should have some limit later on
        if(e.keyCode == Phaser.Keyboard.SPACEBAR){
            Client.changeTile();
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
    
    //Change the given tile to another type
    changeTileAt(tileX, tileY, tileType){
        if(tileType === 0){ //grass
            this.tileMap.putTile(0, tileX, tileY);
        }
        else if(tileType === 1){ //sand
            this.tileMap.putTile(1, tileX, tileY);
        }
        else if(tileType === 2){ //stone
            this.tileMap.putTile(2, tileX, tileY);
        }
    },

    //Generates tile objects based on a given 2D tilemap
    //0 == grass
    //1 == sand
    //2 == stone
    generateTiles: function(tileMap){
        for(let i = 0; i < tileMap.length; i++){
            for(let j = 0; j < tileMap[i].length; j++){
                if(tileMap[i][j] === 0){ //grass
                    //let tile = this.tileGroup.create(i * 32, j * 32, "grassTile");
                    //tile.scale.x = 2;
                    //tile.scale.y = 2;
                    this.tileMap.putTile(0, i, j);
                }
                else if(tileMap[i][j] === 1){ //sand
                    //let tile = this.tileGroup.create(i * 32, j * 32, "sandTile");
                    //tile.scale.x = 2;
                    //tile.scale.y = 2;
                    this.tileMap.putTile(1, i, j);
                }
                else if(tileMap[i][j] === 2){ //stone
                    //let tile = this.tileGroup.create(i * 32, j * 32, "sandTile");
                    //tile.scale.x = 2;
                    //tile.scale.y = 2;
                    this.tileMap.putTile(2, i, j);
                }
            }
        }
    }
}

