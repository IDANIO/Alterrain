//The controls menu
var ControlsState = function(game){};

ControlsState.prototype = {

    preload: function(){
        //empty
    },

    create: function(){        
        this.controlsUI = new ControlsUI(game, 0, 0);
        
        this.returnText = game.add.bitmapText(GAME_WIDTH / 2, 400, "m5x7", "Press X to go back", 48);
        this.returnText.anchor.setTo(0.5);
        
        this.blipHigh = game.add.audio("blipHigh");
        this.blipHigh.volume = 0.25;
    },

    update: function(){
        if(game.input.keyboard.justPressed(Phaser.Keyboard.X)){
            this.blipHigh.play();
            game.state.start("MainMenuState");
        }
    }
}
