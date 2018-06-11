//The main menu state
var MainMenuState = function(game){
    this.joinTextY = 300;
    this.controlsTextY = 360;
    this.textColor = 0xbf6f4a;
};

MainMenuState.prototype = {
    init: function(){
        //Center the game
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;  
        
        //Make sure the game continues running when out of focus
        game.stage.disableVisibilityChange = true;

        //To make sure any pixel art that's scaled doesn't become blurry
        game.stage.smoothed = false
    },

    preload: function(){
        //Font
        game.load.bitmapFont("m5x7", "assets/font/m5x7.png", "assets/font/m5x7.fnt");
        
        //Main menu background
        game.load.spritesheet("mainMenuBackground", "./assets/img/main_menu_art.png");

        //Spritesheets
        game.load.spritesheet("player", "./assets/img/person_spritesheet_large.png", 32, 32);
        game.load.spritesheet("treasureChest", "./assets/img/treasurechest_spritesheet.png", 32, 32);
        game.load.spritesheet("willowTree", "./assets/img/willow_spritesheet.png", 32, 32);

        //Hacky solution for tile particles
        game.load.spritesheet("tileSpritesheet", "./assets/img/game_tileset.png", 32, 32);

        //Game tileset
        game.load.image("gameTileset", "./assets/img/game_tileset.png", 32, 32);

        //Icons and UI
        game.load.image("arrowIcon", "./assets/img/arrow.png", 32, 32);
        game.load.image("soundIcon", "./assets/img/sound.png", 64, 32);
        game.load.image("lockIcon", "./assets/img/lock.png");
        game.load.image("lockBackground", "./assets/img/chest_icon_box.png");
        game.load.image("inventoryUI", "./assets/img/inventory_ui.png", 48, 128);
        game.load.image("highlightUI", "./assets/img/highlight_ui.png", 37, 34);
        game.load.image("pauseBackground", "./assets/img/pause_background.png");
        game.load.image("menuHighlight", "./assets/img/menu_highlight.png");
        game.load.image("zIcon", "./assets/img/Z_key_icon.png");
        game.load.image("eIcon", "./assets/img/E_key_icon.png");
        game.load.image("escIcon", "./assets/img/Esc_key_icon.png");
        game.load.image("spaceIcon", "./assets/img/Space_key_icon.png");
        game.load.image("arrowKeysIcon", "./assets/img/Arrow_keys_icon.png");

        //Weather-related images
        game.load.image("raindrop", "assets/img/raindrop.png");
        game.load.spritesheet("snowflakes", "assets/img/snowflakes.png", 16, 16);
        game.load.image("screenShader", "assets/img/screen_shader.png");

        //Tile placing sounds
        game.load.audio("placeTileSound", ["assets/audio/place_tile.ogg", "assets/audio/place_tile.mp3"]);
        game.load.audio("errorSound", ["assets/audio/wrong.ogg", "assets/audio/wrong.mp3"]);

        //Abstract sound
        game.load.audio("abstractSound", ["assets/audio/snap01.ogg", "assets/audio/snap01.mp3"]);

        //Treasure chest sounds
        game.load.audio("pickupLootSound", ["assets/audio/pickup_loot01.ogg", "assets/audio/pickup_loot01.mp3"]);
        game.load.audio("chestOpenSound", ["assets/audio/creak.ogg", "assets/audio/creak.mp3"]);
        game.load.audio("chestUnlockSound", ["assets/audio/unlock.ogg", "assets/audio/unlock.mp3"]);
        game.load.audio("chestLockedSound", ["assets/audio/closed_lock.ogg", "assets/audio/closed_lock.mp3"]);

        //Tree sounds
        game.load.audio("treeCutSound", ["assets/audio/chop01.ogg", "assets/audio/chop01.mp3"]);
        game.load.audio("treeDestroyedSound", ["assets/audio/creak01.ogg", "assets/audio/creak01.mp3"]);

        //Weather sounds
        game.load.audio("lightRain", ["assets/audio/light_rain.ogg", "assets/audio/lightRain.mp3"]);

        //Material/texture sounds
        game.load.audio("grassFootsteps", ["assets/audio/grass_footsteps.ogg", "assets/audio/grass_footsteps.mp3"]);
        game.load.audio("sandFootsteps", ["assets/audio/sand_footsteps.ogg", "assets/audio/sand_footsteps.mp3"]);
        game.load.audio("stoneFootsteps", ["assets/audio/stone_footsteps.ogg", "assets/audio/stone_footsteps.mp3"]);

        //Menu sounds
        game.load.audio("blipLow", ["assets/audio/blip_low.ogg", "assets/audio/blip_low.mp3"]);
        game.load.audio("blipHigh", ["assets/audio/blip_high.ogg", "assets/audio/blip_high.mp3"]);
    },

    create: function(){
        //Hacky way to prevent the "jumping canvas" visual bug, based on:
        //http://www.html5gamedevs.com/topic/20075-how-to-align-game-to-center-screen-without-jumping/
        setTimeout( () => {
            document.getElementsByTagName("canvas")[0].style.opacity = 1;
        }, 0 );
        
        this.mainMenuBackground = game.add.sprite(0, 0, "mainMenuBackground");
        
        this.titleText = game.add.bitmapText(GAME_WIDTH / 2, 170, "m5x7", "Alterrain", 64);
        this.titleText.anchor.setTo(0.5);

        this.joinText = game.add.bitmapText(GAME_WIDTH / 2, this.joinTextY, "m5x7", "Join Game", 48);
        this.joinText.anchor.setTo(0.5);

        this.controlsText = game.add.bitmapText(GAME_WIDTH / 2, this.controlsTextY, "m5x7", "Controls", 48);
        this.controlsText.anchor.setTo(0.5);

        this.menuHighlight = game.add.sprite(GAME_WIDTH / 2, this.joinTextY - 8, "menuHighlight");
        this.menuHighlight.anchor.setTo(0.5);
        this.menuChoice = 0;
        
        this.zIcon = game.add.sprite(this.menuHighlight.x - this.menuHighlight.width / 2 - 36, 
                                     this.menuHighlight.y - this.menuHighlight.height / 2 + 2, "zIcon");

        this.blipHigh = game.add.audio("blipHigh");
        this.blipHigh.volume = 0.25;
        this.blipLow = game.add.audio("blipLow");
        this.blipLow.volume = 0.25;
    },

    update: function(){
        //Switch between controls
        if(game.input.keyboard.justPressed(Phaser.Keyboard.UP)){
            if(this.menuChoice === 1){
                this.menuChoice = 0;
                this.menuHighlight.y = this.joinTextY - 8;
                this.zIcon.y = this.menuHighlight.y - this.menuHighlight.height / 2 + 2;
                this.blipLow.play();
            }
        }
        if(game.input.keyboard.justPressed(Phaser.Keyboard.DOWN)){
            if(this.menuChoice === 0){
                this.menuChoice = 1;
                this.menuHighlight.y = this.controlsTextY - 8;
                this.zIcon.y = this.menuHighlight.y - this.menuHighlight.height / 2 + 2;
                this.blipLow.play();
            }
        }

        //Select a menu option
        if(game.input.keyboard.justPressed(Phaser.Keyboard.Z) ||
           game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)){
            if(this.menuChoice === 0){
                this.blipHigh.play();
                game.state.start("GameplayState");
            }
            else if(this.menuChoice === 1){
                this.blipHigh.play();
                game.state.start("ControlsState");
            }
        }
    }
}
