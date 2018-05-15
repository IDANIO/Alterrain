//Player constructor
function Player(game, x, y, key, frame){
    //Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.canMove = true;
    this.moveDuration = 100; //In milliseconds
    this.nextPos = {x: 0, y: 0};
    this.moveTimer = game.time.create(false);
    this.moveTimer.loop(this.moveDuration, this.stepTo, this);
    this.facing = FACING_DOWN;
    this.arrow = null;
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
    if(!this.canMove){
        this.stepTo();
    }
};

Player.prototype.enableArrow = function(){
    //Add arrow indicator
    console.log("Added arrow sprite");
    this.arrow = game.add.sprite(this.x, this.y - 32, "arrow");
};

Player.prototype.ableToMove = function(){
    return this.canMove;
};

Player.prototype.stepTo = function(){
    console.log("Stepped");
    //Movement is in progress
    if(this.x < this.nextPos.x){
        this.x++;
    }
    else if(this.x > this.nextPos.x){
        this.x--;
    }
    else if(this.y < this.nextPos.y){
        this.y++;
    }
    else if(this.y > this.nextPos.y){
        this.y--;
    }
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

  // TMP
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

        /////DEBUG - remove later/////
        this.x = nx;
        this.y = ny;
        if(this.arrow){
            this.arrow.x = this.x;
            this.arrow.y = this.y - 32;
        }
        this.canMove = true
        /////DEBUG - remove later/////
    }
};
