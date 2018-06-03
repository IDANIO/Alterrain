//Player constructor
function Player(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.canMove = true;
    this.moveDuration = 10; //In milliseconds
    this.nextPos = {x: 0, y: 0};

    this.moveTimer = game.time.create(false);
    this.moveSpeed = 4; //Must be a power of 2 and less than 32

    this.facing = FACING_DOWN;

    this.arrowIconOffsetY = -32;
    this.arrowIcon = null;

    this.soundIconDuration = 500; //In milliseconds
    this.soundIconTimer = game.time.create(false);
    this.canMakeSound = true;

    //Add sound-making icon
    this.soundIconOffsetY = -8;
    this.soundIcon = game.add.sprite(this.x, this.y + this.soundIconOffsetY, "soundIcon");
    this.soundIcon.anchor.x = 0.25;
    this.soundIcon.alpha = 0;
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
    // if(!this.canMove){
    //     this.stepTo();
    // }
};

Player.prototype.bringToTop = function(){
    game.world.bringToTop(this);
    game.world.bringToTop(this.soundIcon);
    if(this.arrowIcon){
        game.world.bringToTop(this.arrowIcon);
    }
};

Player.prototype.enableArrowIcon = function(){
    //Add arrow indicator
    this.arrowIcon = game.add.sprite(this.x, this.y + this.arrowIconOffsetY, "arrowIcon");
};

Player.prototype.startSoundTimer = function(){
    this.toggleSoundIcon();
    this.soundIconTimer.add(this.soundIconDuration, this.toggleSoundIcon, this);
    this.soundIconTimer.start();
};

Player.prototype.toggleSoundIcon = function(){
    //Toggle the sound icon on or off
    if(this.soundIcon.alpha === 0){
        this.soundIcon.alpha = 1;
        this.canMakeSound = false;
    }
    else if(this.soundIcon.alpha === 1){
        this.soundIcon.alpha = 0;
        this.canMakeSound = true;
    }
};

//Update any icons that should be following the player
Player.prototype.updateIconPositions = function(nx, ny){
    //Arrow icon
    if(this.arrowIcon){
        this.arrowIcon.x = nx;
        this.arrowIcon.y = ny + this.arrowIconOffsetY;
    }

    //Sound icon
    this.soundIcon.x = nx;
    this.soundIcon.y = ny + this.soundIconOffsetY;
};

Player.prototype.ableToMove = function(){
    return this.canMove;
};

Player.prototype.stepTo = function(){
    //Movement is in progress
    if(this.x < this.nextPos.x){
        this.x += this.moveSpeed;
    }
    else if(this.x > this.nextPos.x){
        this.x -= this.moveSpeed;
    }
    else if(this.y < this.nextPos.y){
        this.y += this.moveSpeed;
    }
    else if(this.y > this.nextPos.y){
        this.y -= this.moveSpeed;
    }
    this.updateIconPositions(this.x, this.y);
    //Check if done moving
    if(this.nextPos.x === this.x && this.nextPos.y === this.y){
        this.canMove = true;
    }
};

/**
 * @param d {FACING_RIGHT || FACING_LEFT || FACING_DOWN || FACING_UP}
 */
Player.prototype.setDirection = function(d) {
  this.facing = d;

  // TODO: Here was a bug
  switch (d){
    case FACING_DOWN:
      this.frame = 0;
      break;
    case FACING_LEFT:
      this.frame = 3;
      break;
    case FACING_RIGHT:
      this.frame = 1;
      break;
    case FACING_UP:
      this.frame = 2;
      break;
    default:
        console.log('should not happen');
  }
};

Player.prototype.moveTo = function(nx, ny){
    if(this.canMove){
        this.canMove = false;
        this.nextPos = {x: nx, y: ny};

        if(this.x < this.nextPos.x){
            this.facing = FACING_RIGHT;
            this.frame = 1;
        }
        else if(this.x > this.nextPos.x){
            this.facing = FACING_LEFT;
            this.frame = 3;
        }
        else if(this.y < this.nextPos.y){
            this.facing = FACING_DOWN;
            this.frame = 0;
        }
        else if(this.y > this.nextPos.y){
            this.facing = FACING_UP;
            this.frame = 2;
        }
    }


  // ----------------------------------------------------------------------
// Player.prototype.setPos = function(x, y){
//   this.x = x * 32;
//   this.y = y * 32;
// }

  // ----------------------------------------------------------------------

};
