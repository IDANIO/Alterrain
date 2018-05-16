//The main menu state
var GameplayState = function(game){
    //Create a playerMap property
    this.playerMap = {};
    this.player = null;
    this.textStyle = {font: "20px Arial", fill: "#FFF"};
};

//Tile-based movement
var playerSpeed = 32;

var tileName = ["Grass", "Sand", "Stone"];

// We are using num-pad representation (Ivan)
//
var FACING_LEFT = 4;
var FACING_UP = 8;
var FACING_DOWN = 2;
var FACING_RIGHT = 6;

//How close the player needs to be, in pixels, to hear a sound play
var MIN_HEARING_DISTANCE = 600;
var TILE_SIZE = 32;

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
        this.createSoundObjects();

        //Set up and create the world tilemap
        //TODO use constants instead of hard-coded numbers
        game.world.setBounds(0, 0, 64 * TILE_SIZE, 64 * TILE_SIZE);
        this.tileGroup = game.add.group();
        this.tileMap = game.add.tilemap();
        this.tileMap.setTileSize(TILE_SIZE, TILE_SIZE);
        this.tileMap.addTilesetImage("gameTileset");
        //new Tilemap(layerName, widthInTiles, heightInTiles, tileWidth, tileHeight)
        this.mainLayer = this.tileMap.create("mainLayer", 64, 64, TILE_SIZE, TILE_SIZE);

        //TODO need to optimize later
        this.tileChoice = 0;

        //Display tile choice
        this.tileText = game.add.text(32, 32, tileName[this.tileChoice], this.textStyle);
        this.tileText.fixedToCamera = true;

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

    createSoundObjects: function(){
        this.placeTileSound = game.add.audio("placeTileSound");
        this.abstractChirpSound = game.add.audio("abstractChirpSound");
    },

    //Adds a new player object to the world
    addNewPlayer: function(id, x, y){
        this.playerMap[id] = new Player(game, x * TILE_SIZE, y * TILE_SIZE, "player");
        game.add.existing(this.playerMap[id]);
    },

    //Set the player reference to the correct player sprite object
    setPlayerReference: function(id){
        this.player = this.playerMap[id];
        this.player.enableArrowIcon();
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
    },

    //Removes a player object from the world with the given id
    removePlayer: function(id){
        this.playerMap[id].destroy();
        delete this.playerMap[id];
    },

    handleKeys: function(e){
        //Emit signals only if the player isn't in the middle of moving already
        if(gameplayState.player.canMove){
            if(e.keyCode == Phaser.Keyboard.UP){
                Client.sendMove(8);
            }
            if(e.keyCode == Phaser.Keyboard.DOWN){
                Client.sendMove(2);
            }
            if(e.keyCode == Phaser.Keyboard.LEFT){
                Client.sendMove(4);
            }
            if(e.keyCode == Phaser.Keyboard.RIGHT){
                Client.sendMove(6);
            }
        }

        //Tile choosing controls
        if(e.keyCode == Phaser.Keyboard.ONE){
            this.tileChoice = 0;
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }
        //Tile choosing controls
        if(e.keyCode == Phaser.Keyboard.TWO){
            this.tileChoice = 1;
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }
        //Tile choosing controls
        if(e.keyCode == Phaser.Keyboard.THREE){
            this.tileChoice = 2;
            //NOTE: Using the gameplayState variable feels like a bad idea
            gameplayState.tileText.text = tileName[this.tileChoice];
        }

        //Change the tile the player is standing on
        //BUG - placing the same tile again shouldn't do anything
        if(e.keyCode == Phaser.Keyboard.SPACEBAR){
            Client.changeTile(this.tileChoice, gameplayState.player.facing);
        }

        //Play abstract sound
        if(e.keyCode == Phaser.Keyboard.E){
            Client.playSound();
        }

        //Quit key - go back to the main menu
        if(e.keyCode == Phaser.Keyboard.ESC){
            game.state.start("MainMenuState");
        }
    },

    playAbstractSoundFrom: function(playerId){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer.canMakeSound){
            this.playSoundFrom(this.abstractChirpSound, sourcePlayer.x, sourcePlayer.y);
            sourcePlayer.startSoundTimer();
        }
    },

    //Moves the player to the given position
    movePlayer: function(id, x, y, d){
        //this.playerMap[id].x = x;
        //this.playerMap[id].y = y;
      // console.log(`${x},${y},${d}`)
      this.playerMap[id].setDirection(d);
        if(this.playerMap[id].ableToMove()){
            this.playerMap[id].moveTo(x * TILE_SIZE, y * TILE_SIZE);
        }
    },

    //Change the given tile to another type
    changeTileAt(tileX, tileY, tileType){
        if(tileX < 0 || tileX >= this.tileMap.width || tileY < 0 || tileY >= this.tileMap.height){
            console.log("invalid tile position");
            return;
        }
        let sourceX = tileX * TILE_SIZE;
        let sourceY = tileY * TILE_SIZE;
        this.playSoundFrom(this.placeTileSound, sourceX, sourceY);
        /*if(tileType === 0){ //grass
            this.tileMap.putTile(0, tileX, tileY);
        }
        else if(tileType === 1){ //sand
            this.tileMap.putTile(1, tileX, tileY);
        }
        else if(tileType === 2){ //stone
            this.tileMap.putTile(2, tileX, tileY);
        }
        else if(tileType === 3){ //water
            this.tileMap.putTile(3, tileX, tileY);
        }*/
        this.tileMap.putTile(tileType, tileX, tileY);
    },

    //Generates tile objects based on a given 2D tilemap
    //0 == grass
    //1 == sand
    //2 == stone
    generateTiles: function(tileMap){
        for(let i = 0; i < tileMap.length; i++){
            for(let j = 0; j < tileMap[i].length; j++){
                /*if(tileMap[i][j] === 0){ //grass
                    this.tileMap.putTile(0, i, j);
                }
                else if(tileMap[i][j] === 1){ //sand
                    this.tileMap.putTile(1, i, j);
                }
                else if(tileMap[i][j] === 2){ //stone
                    this.tileMap.putTile(2, i, j);
                }*/
                this.tileMap.putTile(tileMap[i][j], i, j);
            }
        }
    },

    //Plays a given sound with volume inversely scaled to the distance from the source
    playSoundFrom: function(sfx, x, y){
        let dist = this.getDistance(x, y, this.player.x, this.player.y);
        console.log("Dist: " + dist);
        let factor = dist / MIN_HEARING_DISTANCE;
        if(factor > 1){
            factor = 1;
        }
        sfx.volume = 1 - factor;
        if(sfx.volume > 0){
            sfx.play();
        }
    },

    //Returns the distance between 2 points
    getDistance: function(x1, y1, x2, y2){
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}

