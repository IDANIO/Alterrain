//The world size in tiles
var WORLD_WIDTH = 88;
var WORLD_HEIGHT = 88;

//The main menu state
var GameplayState = function(game){
    //Create a playerMap property
    this.playerMap = {};
    
    //Make a reference to the local player
    this.player = null;

    //Create a 2D array for solid objects
    this.objectMap = [];
    for(let i = 0; i < WORLD_HEIGHT; i++){
        this.objectMap[i] = [];
    }

    this.weatherEffects = [];
    this.isRainOn = false;
};

//Tile-based movement
var playerSpeed = 32;

var tileName = ["Grass", "Sand", "Stone", "Water", "Bridge", "Forest", "Snow", "Desert", "Ice"];

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
        game.world.setBounds(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE);
        this.tileGroup = game.add.group();
        this.tileMap = game.add.tilemap();
        this.tileMap.setTileSize(TILE_SIZE, TILE_SIZE);
        this.tileMap.addTilesetImage("gameTileset");
        //new Tilemap(layerName, widthInTiles, heightInTiles, tileWidth, tileHeight)
        this.mainLayer = this.tileMap.create("mainLayer", WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE, TILE_SIZE);

        //The currently selected tile
        this.tileChoice = 0;

        //Handle input
        game.input.keyboard.onDownCallback = this.handleKeys;

        //Create a group for solid objects - to be drawn below UI
        this.solidObjectsGroup = game.add.group();

        //Create a group for player sprites - to be drawn below UI
        this.playersGroup = game.add.group();

        //Create a group for player icon sprites - drawn above players but below UI
        this.playerIconsGroup = game.add.group();

        //Create a group for treasure chest related UI
        this.treasureUIGroup = game.add.group();

        //Create a group for UI elements
        this.uiGroup = game.add.group();
        this.uiGroup.fixedToCamera = true;

        this.initializeWeatherEffects();
        
        //Create the pause/quit UI
        this.pauseUI = new PauseUI(game, 0, 0);
        this.uiGroup.add(this.pauseUI.promptText);
        this.uiGroup.add(this.pauseUI.choiceText);
        this.pauseUI.hide();

        //Create the inventoryUI
        this.playerInventoryUI = new InventoryUI(game, 120, 393, "inventoryUI");
        this.uiGroup.add(this.playerInventoryUI);
        for(let i = 0; i < this.playerInventoryUI.itemsText.length; i++){
            this.uiGroup.add(this.playerInventoryUI.itemsText[i]);
        }
        this.uiGroup.add(this.playerInventoryUI.highlightUI);
        for(let i = 0; i < this.playerInventoryUI.itemsText.length; i++){
            this.uiGroup.add(this.playerInventoryUI.numbersText[i]);
        }

        //Display tile choice
        this.tileText = game.add.bitmapText(320, 450, "m5x7", tileName[this.tileChoice], 48);
        this.tileText.anchor.x = 0.5;
        this.uiGroup.add(this.tileText);

        //Loading "screen" while the tilemap is generated
        this.controlsUI = new ControlsUI(game, 0, 0);
        this.loadingText = game.add.bitmapText(GAME_WIDTH / 2, 430, "m5x7", "Loading...", 48);
        this.loadingText.anchor.setTo(0.5);


        // -------------------------------------- Ivan's change
        this.cursors = game.input.keyboard.createCursorKeys();
    },

    shutdown: function(){
        // --------------------------------------
        Client.disconnectFromServer();
        // --------------------------------------

    },

    // Code Modified from RPG Maker
    updateInput(){
      let x = 0;
      let y = 0;

      // Arrow input
      if (this.cursors.up.isDown) {
        y--;
      }
      if (this.cursors.down.isDown) {
        y++;
      }

      if (this.cursors.left.isDown) {
        x--;
      }
      if (this.cursors.right.isDown) {
        x++;
      }

      let dir8 = 0;
      if (x !== 0 || y !== 0) {
        dir8 = 5 - y * 3 + x;
      }

      if (x !== 0 && y !== 0) {
        if (this._preferredAxis === 'x') {
          y = 0;
        } else {
          x = 0;
        }
      } else if (x !== 0) {
        this._preferredAxis = 'y';
      } else if (y !== 0) {
        this._preferredAxis = 'x';
      }

      let dir4 = 0;
      if (x !== 0 || y !== 0) {
        dir4 = 5 - y * 3 + x;
      }

      if (this.player && this.player.canMove){
        Client.sendInputs(dir4);
      }
    },

    update: function(){
        this.updateInput();

        //Pausing controls
        if(this.pauseUI.paused){
            if(game.input.keyboard.justPressed(Phaser.Keyboard.ESC)){
                this.pauseUI.hide();
            }
            if(game.input.keyboard.justPressed(Phaser.Keyboard.Y)){
                this.stopAllSounds();
                game.state.start("MainMenuState");
            }
        }
        else{
            if(game.input.keyboard.justPressed(Phaser.Keyboard.ESC)){
                this.pauseUI.show();
            }
        }
    },

    initializeWeatherEffects: function(){
        //Screen shader
        this.screenShader = game.add.sprite(0, 0, "screenShader");
        this.screenShader.scale.x = game.world.width;
        this.screenShader.scale.y = game.world.height;
        this.screenShader.tint = 0x777777;
        this.screenShader.alpha = 0;
        this.weatherEffects[0] = this.screenShader;
        
        //Rain
        this.rainEmitter = game.add.emitter(game.world.centerX, 0, 256);
        this.rainEmitter.fixedToCamera = true;
        this.rainEmitter.makeParticles(["raindrop"], 0, 256);
        this.rainEmitter.gravity = 0;
        this.rainEmitter.setRotation(0, 0);
        this.rainEmitter.setXSpeed(-128, -128);
        this.rainEmitter.setYSpeed(512, 512);
        this.rainEmitter.setScale(2, 2, 2, 2);
        this.rainEmitter.setAlpha(0.3, 0.7);
        let area = new Phaser.Rectangle(game.world.centerX, 0, game.world.width, 1);
        this.rainEmitter.area = area;
        this.weatherEffects[1] = this.rainEmitter;
        this.rainEmitter.start(false, 2000, 10);
        this.rainEmitter.on = false;
        
        //Snow/blizzard
        this.snowEmitter = game.add.emitter(game.world.centerX, 0, 512);
        this.snowEmitter.fixedToCamera = true;
        this.snowEmitter.makeParticles("snowflakes", [0, 1, 2], 400);
        this.snowEmitter.gravity = 0;
        this.snowEmitter.setXSpeed(-20, -20);
        this.snowEmitter.setYSpeed(96, 96);
        this.snowEmitter.minParticleScale = 0.5;
        this.snowEmitter.maxParticleScale = 1.5;
        this.snowEmitter.setAlpha(0.5, 0.9);
        this.snowEmitter.area = area;
        this.weatherEffects[2] = this.snowEmitter;
        this.snowEmitter.start(false, 10000, 64);
        this.snowEmitter.on = false;
    },

    startWeatherEffect: function(weatherType){
        if(weatherType === 0){ //no weather
            this.stopRainEffect();
            this.stopSnowEffect();
        }
        else if(weatherType === 1){ //rain
            this.stopSnowEffect();
            this.startRainEffect();
        }
        else if(weatherType === 2){ //snow
            this.stopRainEffect();
            this.startSnowEffect();
        }
        else if(weatherType === 3){
            this.startRainEffect(); //rain + snow
            this.startSnowEffect();
        }
    },

    startRainEffect: function(){
        if(!this.lightRainSound.isPlaying){
            this.lightRainSound.play();
        }
        this.screenShader.tint = 0x999999;
        game.add.tween(this.screenShader).to( { alpha: 0.4 }, 1500, "Linear", true);
        this.rainEmitter.on = true;
    },

    stopRainEffect: function(){
        if(this.lightRainSound.isPlaying){
            this.lightRainSound.stop();
        }
        game.add.tween(this.screenShader).to( { alpha: 0 }, 1500, "Linear", true);
        this.rainEmitter.on = false;;
    },
    
    startSnowEffect: function(){
        this.screenShader.tint = 0xFFFFFF;
        game.add.tween(this.screenShader).to( { alpha: 0.3 }, 1500, "Linear", true);
        this.snowEmitter.on = true;
    },

    stopSnowEffect: function(){
        game.add.tween(this.screenShader).to( { alpha: 0 }, 1500, "Linear", true);
        this.snowEmitter.on = false;
    },

    createSoundObjects: function(){
        this.placeTileSound = game.add.audio("placeTileSound");
        this.errorSound = game.add.audio("errorSound");
        this.errorSound.volume = 0.2;
        this.abstractSound = game.add.audio("abstractSound");
        this.pickupLootSound = game.add.audio("pickupLootSound");
        this.chestOpenSound = game.add.audio("chestOpenSound");
        this.chestUnlockSound = game.add.audio("chestUnlockSound");
        this.treeCutSound = game.add.audio("treeCutSound");
        this.treeDestroyedSound = game.add.audio("treeDestroyedSound");

        this.grassSound = game.add.audio("grassFootsteps");
        this.sandSound = game.add.audio("sandFootsteps");
        this.stoneSound = game.add.audio("stoneFootsteps");

        this.lightRainSound = game.add.audio("lightRain", 1, true);

        this.tileSounds = [this.grassSound, this.sandSound, this.stoneSound];
    },

    stopAllSounds: function(){
        if(this.lightRainSound.isPlaying){
            this.lightRainSound.stop();
        }
    },

    //Adds a new player object to the world
    addNewPlayer: function(id, x, y){
        this.playerMap[id] = new Player(game, Math.floor(x * TILE_SIZE), Math.floor(y * TILE_SIZE), "player");
        //game.add.existing(this.playerMap[id]);
        this.playersGroup.add(this.playerMap[id]);
        //Make sure the local player is drawn on top of other players
        if(this.player){
            this.player.bringToTop();
            //Make sure the UI and weather stays on top
            for(let i = 0; i < this.weatherEffects.length; i++){
                game.world.bringToTop(this.weatherEffects[i]);
            }
            if(this.uiGroup){
                game.world.bringToTop(this.uiGroup);
            }
        }
    },

    //Set the player reference to the correct player sprite object
    setPlayerReference: function(id){
        this.player = this.playerMap[id];
        this.player.enableArrowIcon();
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
        this.player.bringToTop();
        //Make sure the UI and weather stays on top
        for(let i = 0; i < this.weatherEffects.length; i++){
            game.world.bringToTop(this.weatherEffects[i]);
        }
        if(this.uiGroup){
            game.world.bringToTop(this.uiGroup);
        }
    },

    //Removes a player object from the world with the given id
    removePlayer: function(id){
        this.playerMap[id].destroy();
        delete this.playerMap[id];
    },

    handleKeys: function(e){
        //Emit signals only if the player isn't in the middle of moving already
        // if(gameplayState.player && gameplayState.player.canMove){
        //     if(e.keyCode === Phaser.Keyboard.UP){
        //         // Client.sendMove(8);
        //       console.log(8);
        //     }
        //     if(e.keyCode === Phaser.Keyboard.DOWN){
        //         // Client.sendMove(2);
        //       console.log(2);
        //     }
        //     if(e.keyCode === Phaser.Keyboard.LEFT){
        //         // Client.sendMove(4);
        //       console.log(4);
        //     }
        //     if(e.keyCode === Phaser.Keyboard.RIGHT){
        //         // Client.sendMove(6);
        //       console.log(6);
        //     }
        // }

        //Tile choosing controls
        if(e.keyCode === Phaser.Keyboard.ONE){
            gameplayState.tileChoice = 0; //grass
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice);
        }
        if(e.keyCode === Phaser.Keyboard.TWO){
            gameplayState.tileChoice = 1; //sand
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice);
        }
        if(e.keyCode === Phaser.Keyboard.THREE){
            gameplayState.tileChoice = 2; //stone
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice);
        }
        if(e.keyCode === Phaser.Keyboard.FOUR){
            gameplayState.tileChoice = 4; //bridge
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice - 1);
        }
        if(e.keyCode === Phaser.Keyboard.FIVE){
            gameplayState.tileChoice = 5; //forest
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice - 1);
        }
        if(e.keyCode === Phaser.Keyboard.SIX){
            gameplayState.tileChoice = 6; //snow
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice - 1);
        }
        if(e.keyCode === Phaser.Keyboard.SEVEN){
            gameplayState.tileChoice = 7; //desert
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice - 1);
        }
        if(e.keyCode === Phaser.Keyboard.EIGHT){
            gameplayState.tileChoice = 8; //ice
            gameplayState.tileText.text = tileName[gameplayState.tileChoice];
            gameplayState.playerInventoryUI.updateHighlight(gameplayState.tileChoice - 1);
        }

        //Change the tile in front of the player
        if(e.keyCode === Phaser.Keyboard.SPACEBAR){
            Client.changeTile(gameplayState.tileChoice, gameplayState.player.facing);
        }

        //Interact with a treasure chest
        if(e.keyCode === Phaser.Keyboard.Z){
            Client.interact();
        }

        //Play abstract sound
        if(e.keyCode === Phaser.Keyboard.E){
            Client.playSound();
        }
    },

    updatePlayerInventory: function(playerId, inventory){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer === this.player){
            this.playerInventoryUI.updateDisplay(inventory);
        }
    },

    playAbstractSoundFrom: function(playerId){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer.canMakeSound){
            this.playSoundFrom(this.abstractSound, sourcePlayer.x, sourcePlayer.y, 1);
            sourcePlayer.startSoundTimer();
        }
    },

    playErrorSound: function(playerId){
        let sourcePlayer = this.playerMap[playerId];
        if(sourcePlayer === this.player){
            this.errorSound.play();
        }
    },

    // ----------------------------------------------------------------------

    updatePlayerPos: function(id, x, y, d){
       let sprite = this.playerMap[id];

       let screenX = Math.floor(x * TILE_SIZE);
       let screenY = Math.floor(y * TILE_SIZE);

       sprite.updateIconPositions(screenX, screenY);

       sprite.canMove = Number.isInteger(x) && Number.isInteger(y);

       sprite.x = screenX;
       sprite.y = screenY;

       sprite.setDirection(d);
    },

    // ----------------------------------------------------------------------

    //Moves the player to the given position
    movePlayer: function(id, x, y, d){
       //this.playerMap[id].x = x;
       //this.playerMap[id].y = y;

      // this.playerMap[id].setDirection(d);
      //   if(this.playerMap[id].ableToMove()){
      //       this.playerMap[id].moveTo(x * TILE_SIZE, y * TILE_SIZE);
      //   }
    },

    //Change the given tile to another type
    changeTileAt(tileX, tileY, tileType){
        if(tileX < 0 || tileX >= this.tileMap.width || tileY < 0 || tileY >= this.tileMap.height){
            console.log("invalid tile position");
            return;
        }
        let sourceX = tileX * TILE_SIZE;
        let sourceY = tileY * TILE_SIZE;
        this.playSoundFrom(this.placeTileSound, sourceX, sourceY, 0.15);
        this.tileMap.putTile(tileType, tileX, tileY);
        //if(this.tileSounds[tileType]){
            //this.playSoundFrom(this.tileSounds[tileType], sourceX, sourceY);
        //}
    },

    //Generates tile objects based on a given 2D tilemap
    //0 === grass
    //1 === sand
    //2 === stone
    //3 == water
    //4 == bridge
    //5 == forest
    //6 == snow
    //7 == desert
    //8 = ice
    generateTiles: function(tileMap){
        for(let i = 0; i < tileMap.length; i++){
            for(let j = 0; j < tileMap[i].length; j++){
                this.tileMap.putTile(tileMap[i][j], i, j);
            }
        }
        this.controlsUI.destroy();
        this.loadingText.destroy();
    },

    //Generates solid objects based on a given 2D object map
    generateSolidObjects: function(objectMap){
        for(let i = 0; i < objectMap.length; i++){
            for(let j = 0; j < objectMap[i].length; j++){
                this.placeSolidObject(objectMap[i][j], i, j, objectMap[i][j].durability);
            }
        }
    },

    //Spawns treasure chests based on an array of them
    spawnTreasureChests: function(arr){
        for(let i = 0; i < arr.length; i++){
            this.objectMap[arr[i].x][arr[i].y] = new Treasure(game, arr[i].x * TILE_SIZE, arr[i].y * TILE_SIZE, "treasureChest");
            this.objectMap[arr[i].x][arr[i].y].setState(arr[i].state);
            this.objectMap[arr[i].x][arr[i].y].setSize(arr[i].playerRequired);
            this.solidObjectsGroup.add(this.objectMap[arr[i].x][arr[i].y]);
            this.solidObjectsGroup.add(this.objectMap[arr[i].x][arr[i].y].lootEmitter);

            this.treasureUIGroup.add(this.objectMap[arr[i].x][arr[i].y].lockBackground);
            this.treasureUIGroup.add(this.objectMap[arr[i].x][arr[i].y].lockCountText);
            this.treasureUIGroup.add(this.objectMap[arr[i].x][arr[i].y].lockIcon);
        }
    },

    //Helper function for placing individual solid objects
    placeSolidObject: function(objectType, tileX, tileY, objectState){
        if(objectType === 0){
            this.objectMap[tileX][tileY] = new Tree(game, tileX * TILE_SIZE, tileY * TILE_SIZE, "willowTree");
            this.objectMap[tileX][tileY].setState(objectState);
            this.solidObjectsGroup.add(this.objectMap[tileX][tileY]);
        }
        //Unfinished
        /*else if(objectType === 1){
            this.objectMap[tileX][tileY] = new Rock(game, tileX * TILE_SIZE, tileY * TILE_SIZE);
            game.add.existing(this.objectMap[tileX][tileY]);
        }*/
    },

    //Delete an object at a given tile position
    deleteObjectAt: function(tileX, tileY){
        if(this.objectMap[tileX][tileY]){
            this.objectMap[tileX][tileY].destroy();
        }
    },

    //Interact with a specific treasure chest
    interactWithChest: function(tileX, tileY, state, playersRequired){
        let treasureChest = this.objectMap[tileX][tileY];
        if(treasureChest){
            //New player unlocked 1 lock in this chest
            if(state === 0){
                //this never runs
            }
            //Old player tried to interact with treasure chest, so nothing happens
            if(state === 1){
                if(playersRequired == treasureChest.numPlayersRequired){ //old player
                    //TODO locked sound
                    console.log("Old player tried unlocking treasure chest");
                }
                else{ //new player
                    this.playSoundFrom(this.chestUnlockSound, tileX * TILE_SIZE, tileY * TILE_SIZE);
                    //treasureChest.frame--;
                    treasureChest.unlockOnce();
                }
            }
            //Treasure chest's last lock opened
            if(state === 2){
                treasureChest.open();
                this.playSoundFrom(this.chestOpenSound, tileX * TILE_SIZE, tileY * TILE_SIZE);
            }
            if(state == 3){
                if(treasureChest.frame !== 0){
                    treasureChest.frame = 0;
                    treasureChest.lootEmitter.on = false;
                    this.playSoundFrom(this.pickupLootSound, tileX * TILE_SIZE, tileY * TILE_SIZE, 0.3);
                }
            }
        }
    },

    //Cut a specific tree, playing a different sound depending on its remaining hitpoints
    cutTree: function(tileX, tileY, hitpoints){
        let tx = tileX * TILE_SIZE;
        let ty = tileY * TILE_SIZE;
        if(hitpoints > 0){
            this.playSoundFrom(this.treeCutSound, tx, ty, 0.25);
        }
        else if(hitpoints === 0){
            this.playSoundFrom(this.treeDestroyedSound, tx, ty, 0.25);
            let treeObj = this.objectMap[tileX][tileY];
            treeObj.cutDown();
        }
    },

    //Plays a given sound with volume inversely scaled to the distance from the source
    playSoundFrom: function(sfx, x, y, initialVolume = 1){
        let dist = this.getDistance(x, y, this.player.x, this.player.y);
        let factor = dist / MIN_HEARING_DISTANCE;
        if(factor > 1){
            factor = 1;
        }
        if(initialVolume === 1){
            sfx.volume = 1 - factor;
        }
        else{
            sfx.volume = (1 - factor) * initialVolume;
        }
        console.log(sfx.volume);
        if(sfx.volume > 0){
            sfx.play();
        }
    },

    //Returns the distance between 2 points
    getDistance: function(x1, y1, x2, y2){
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}

