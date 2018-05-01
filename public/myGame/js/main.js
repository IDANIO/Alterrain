



//ONly works on FireFox, not chrome

//list from left to right of parameters
//width, height of canvas,rendering context, id of the DOM element in which you would like to insert the canvas element that Phaser creates
//Change the game resolution to a vertical aspect ratio so the game is taller than it is wide.
var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
//var game = new Phaser.Game(800, 600, Phaser.AUTO);
// add states to StateManager and start MainMenu

	//variables used to display stars collected
	var score = 0;
	var scoreText;
    var mountains;
    var jumptime = 0;
var MainMenu = {

    preload: function(){
        game.load.image('newstart', 'assets/newstart.png');
        game.load.image('mountains', 'assets/mountains.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('baddie', 'assets/baddie.png');
        game.load.atlas('newatlas', 'assets/newatlas.png', 'assets/newsprites.json');
        },

    create: function(){
        game.stage.backgroundColor = "#facade";
        game.add.sprite(0, 0, 'newstart');
    },

    update: function(){
        if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            game.state.start('GamePlay');
        }
    }

};

var GamePlay = {


 preload: function() {
	// preload assets
	//images name and path

},

 create: function() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.spritesheet = game.add.sprite(game.world.centerX, 300, 'spritesheet');
    mountains = game.add.tileSprite(0,-60,800,600,'mountains');
    // The player and its settings
    player = game.add.sprite(250, game.world.height - 150,'newatlas', 'golem2');
    //player.scale.x==1;
    player.anchor.setTo(.5,.5);
    player.animations.add('right',Phaser.Animation.generateFrameNames('golem',1,3),10,true);
   // player.animations.add('left',Phaser.Animation.generateFrameNames('golem',4,6),5,true);


    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.13;
    player.body.gravity.y = 400;
    player.body.collideWorldBounds = true;

    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(900 + Math.random()*800 ,i*40+50, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 40;
        star.body.velocity.x = -200 - 200*Math.random();
        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.4 + Math.random() * 0.2;
    }

    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

},

	 update: function() {
    mountains.tilePosition.x += -2;
	// run game loop
	var hitPlatform = game.physics.arcade.collide(player, platforms);

	//set cursor keys
	cursors = game.input.keyboard.createCursorKeys();


    //player movement
    player.animations.play('right');
    /*
   if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
    }
    else if(!hitPlatform)//if player is in the air not moving to the right, slowly move him to the left
    {
        player.body.velocity.x = -100;
    }
    else
         player.body.velocity.x = -150;
     */
    if (cursors.up.isDown && player.body.touching.down && hitPlatform)   //  Allow the player to jump if they are touching the ground.

    {
        player.body.velocity.y = -250;
       // jumptime = game.time.now + 10; 
    }
    


    game.physics.arcade.collide(stars, platforms);
    
    //if the player collides with a star, destroy the star and increment the player score
	function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
	}


	game.physics.arcade.overlap(player, stars, collectStar, null, this);

        if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            game.state.start('GameOver');
        }    
    }


};

var GameOver =  {
    preload: function(){
        game.load.image('GameOver', 'assets/GameOver.png');    },

    create: function(){
        game.add.sprite(0, 0, 'GameOver');
        game.stage.backgroundColor = "#bb11ee";
    },

    update: function(){
        if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            game.state.start('MainMenu');
        }
    }


};
game.state.add('MainMenu', MainMenu);
game.state.add('GamePlay', GamePlay);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');