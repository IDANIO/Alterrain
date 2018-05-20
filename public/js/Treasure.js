//Treasure constructor
function Treasure(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    //Default - require 1 player only to open
    this.numPlayersRequired = 1;
    this.frame = 1;
}

Treasure.prototype = Object.create(Phaser.Sprite.prototype);
Treasure.prototype.constructor = Tree;

Treasure.setSize = function(size){
    this.numPlayersRequired = size;
    this.frame = size;
};

//Set whether the treasure chest should be hidden or not
Treasure.setHidden = function(flag){
    this.hidden = flag;
    if(this.hidden){
        this.alpha = 0;
    }
    else{
        this.alpha = 1;
    }
}

Treasure.digUp = function(){
    this.setHidden(false);
}

Treasure.unlock = function(state){
    
}
