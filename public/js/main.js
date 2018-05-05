var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);

var mainMenuState = new MainMenuState(game);
var gameplayState = new GameplayState(game);

//Add the states to the state manager
game.state.add("MainMenuState", mainMenuState);
game.state.add("GameplayState", gameplayState);

game.state.start("MainMenuState");
