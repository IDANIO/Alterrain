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

Treasure.prototype.setSize = function(size){
    if(size > 0){
        this.numPlayersRequired = size;
        this.frame = size + 1;
    }
};

Treasure.prototype.setState = function(state){
    if(state === 3){
        this.frame = 0;
    }
    else if(state === 2){
        this.frame = 1;
    }
    else if(state === 1 || state === 0){
        this.frame = 2;
    }
};

//Set whether the treasure chest should be hidden or not
Treasure.prototype.setHidden = function(flag){
    this.hidden = flag;
    if(this.hidden){
        this.alpha = 0;
    }
    else{
        this.alpha = 1;
    }
};

Treasure.prototype.digUp = function(){
    this.setHidden(false);
};

Treasure.prototype.unlock = function(state){
    
};
