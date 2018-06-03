//Controls UI constructor
function ControlsUI(game, x, y){
    this.game = game;
    this.x = x || 0;
    this.y = y || 0;
    
    this.screenShader = game.add.sprite(0, 0, "screenShader");
    this.screenShader.scale.x = game.world.width;
    this.screenShader.scale.y = game.world.height;
    this.screenShader.tint = 0x5d2c28;
    
    this.titleText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 100, "m5x7", "CONTROLS", 48);
    this.titleText.anchor.setTo(0.5);
    
    this.movementText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 170, "m5x7", "Arrow Keys to move", 48);
    this.movementText.anchor.setTo(0.5);
    
    this.interactText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 210, "m5x7", "Z to interact with objects", 48);
    this.interactText.anchor.setTo(0.5);
    
    this.placeText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 250, "m5x7", "X to place tiles", 48);
    this.placeText.anchor.setTo(0.5);
    
    this.makeSoundText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 290, "m5x7", "E to make a sound", 48);
    this.makeSoundText.anchor.setTo(0.5);
}

ControlsUI.prototype.destroy = function(){
    this.screenShader.destroy();
    this.titleText.destroy();
    this.movementText.destroy();
    this.interactText.destroy();
    this.placeText.destroy();
    this.makeSoundText.destroy();
}