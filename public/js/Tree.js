//Tree constructor
function Tree(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    //The amount of resources to give to the player when the tree is chopped
    this.minResourceAmount = 4;
    this.maxResourceAmount = 8;
}

Tree.prototype = Object.create(Phaser.Sprite.prototype);
Tree.prototype.constructor = Tree;

Tree.prototype.cutDown = function(){
    this.frame = 1;
};

Tree.prototype.setState = function(hitpoints){
    if(hitpoints <= 0){
        this.frame = 1;
    }
    else{
        this.frame = 0;
    }
};
