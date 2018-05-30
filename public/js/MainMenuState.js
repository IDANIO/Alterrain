//The main menu state
var MainMenuState = function(game){
    //this.textStyle = {font: "32px Arial", fill: "#FFF"};
    this.joinTextY = 300;
    this.controlsTextY = 360;
};

MainMenuState.prototype = {
    init: function(){
        //Make sure the game continues running when out of focus
        game.stage.disableVisibilityChange = true;
        
        //To make sure any pixel art that's scaled doesn't become blurry
        game.stage.smoothed = false
    },

    preload: function(){
        game.load.bitmapFont("m5x7", "assets/font/m5x7.png", "assets/font/m5x7.fnt");
        
        game.load.spritesheet("player", "./assets/img/person_spritesheet_large.png", 32, 32);
        game.load.spritesheet("treasureChest", "./assets/img/treasurechest_spritesheet.png", 32, 32);
        game.load.spritesheet("willowTree", "./assets/img/willow_spritesheet.png", 32, 32);
        game.load.image("gameTileset", "./assets/img/game_tileset.png", 32, 32);
        game.load.image("arrowIcon", "./assets/img/arrow.png", 32, 32);
        game.load.image("soundIcon", "./assets/img/sound.png", 64, 32);
        game.load.image("inventoryUI", "./assets/img/inventory_ui.png", 48, 128);
        game.load.image("highlightUI", "./assets/img/highlight_ui.png", 37, 34);
        game.load.image("menuHighlight", "./assets/img/menu_highlight.png");
        //game.load.image("willowTree", "./assets/img/willowtree.png", 32, 32);
        
        game.load.image("raindrop", "assets/img/raindrop.png");
        game.load.image("screenShader", "assets/img/screen_shader.png");
        
        game.load.audio("placeTileSound", ["assets/audio/place_tile.ogg", "assets/audio/place_tile.mp3"]);
        game.load.audio("errorSound", ["assets/audio/wrong.ogg", "assets/audio/wrong.mp3"]);
        game.load.audio("abstractChirpSound", ["assets/audio/abstract_chirp01.ogg", "assets/audio/abstract_chirp01.mp3"]);
        game.load.audio("pickupLootSound", ["assets/audio/pickup_loot01.ogg", "assets/audio/pickup_loot01.mp3"]);
        game.load.audio("chestOpenSound", ["assets/audio/creak.ogg", "assets/audio/creak.mp3"]);
        game.load.audio("chestUnlockSound", ["assets/audio/unlock.ogg", "assets/audio/unlock.mp3"]);
        
        game.load.audio("treeCutSound", ["assets/audio/chop01.ogg", "assets/audio/chop01.mp3"]);
        game.load.audio("treeDestroyedSound", ["assets/audio/creak01.ogg", "assets/audio/creak01.mp3"]);
        
        game.load.audio("lightRain", ["assets/audio/light_rain.ogg", "assets/audio/lightRain.mp3"]);
        
        game.load.audio("grassFootsteps", ["assets/audio/grass_footsteps.ogg", "assets/audio/grass_footsteps.mp3"]);
        game.load.audio("sandFootsteps", ["assets/audio/sand_footsteps.ogg", "assets/audio/sand_footsteps.mp3"]);
        game.load.audio("stoneFootsteps", ["assets/audio/stone_footsteps.ogg", "assets/audio/stone_footsteps.mp3"]);
    },

    create: function(){        
        this.titleText = game.add.bitmapText(GAME_WIDTH / 2, 180, "m5x7", "Alterrain", 64);
        this.titleText.anchor.setTo(0.5);
        
        this.joinText = game.add.bitmapText(GAME_WIDTH / 2, this.joinTextY, "m5x7", "Join Game", 48);
        this.joinText.anchor.setTo(0.5);
        
        this.controlsText = game.add.bitmapText(GAME_WIDTH / 2, this.controlsTextY, "m5x7", "Controls", 48);
        this.controlsText.anchor.setTo(0.5);
        
        this.menuHighlight = game.add.sprite(GAME_WIDTH / 2, this.joinTextY - 8, "menuHighlight");
        this.menuHighlight.anchor.setTo(0.5);
        this.menuChoice = 0;

        //Center the game
        game.scale.pageAlignHorizontally = true;
    },

    update: function(){
        //Switch between controls
        if(game.input.keyboard.justPressed(Phaser.Keyboard.UP)){
            if(this.menuChoice === 1){
                this.menuChoice = 0;
                this.menuHighlight.y = this.joinTextY - 8;
            }
        }
        if(game.input.keyboard.justPressed(Phaser.Keyboard.DOWN)){
            if(this.menuChoice === 0){
                this.menuChoice = 1;
                this.menuHighlight.y = this.controlsTextY - 8;
            }
        }
        
        //Select a menu option
        if(game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)){
            if(this.menuChoice === 0){
                game.state.start("GameplayState");
            }
            else if(this.menuChoice === 1){
                game.state.start("ControlsState");
            }
        }
    }
}
