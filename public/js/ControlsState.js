//The controls menu
var ControlsState = function(game){};

ControlsState.prototype = {

    preload: function(){
        //empty
    },

    create: function(){        
        this.movementText = game.add.bitmapText(GAME_WIDTH / 2, 150, "m5x7", "Arrow Keys to move", 48);
        this.movementText.anchor.setTo(0.5);
        
        this.interactText = game.add.bitmapText(GAME_WIDTH / 2, 190, "m5x7", "Z to interact with objects", 48);
        this.interactText.anchor.setTo(0.5);
        
        this.placeText = game.add.bitmapText(GAME_WIDTH / 2, 230, "m5x7", "Space to place tiles", 48);
        this.placeText.anchor.setTo(0.5);
        
        this.returnText = game.add.bitmapText(GAME_WIDTH / 2, 400, "m5x7", "Press Esc to go back", 48);
        this.returnText.anchor.setTo(0.5);
    },

    update: function(){
        if(game.input.keyboard.justPressed(Phaser.Keyboard.ESC)){
            game.state.start("MainMenuState");
        }
    }
}
