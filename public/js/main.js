var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var game;
var mainMenuState;
var gameplayState;

window.onload = function(){
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);

    mainMenuState = new MainMenuState(game);
    gameplayState = new GameplayState(game);

    //Add the states to the state manager
    game.state.add("MainMenuState", mainMenuState);
    game.state.add("GameplayState", gameplayState);

    game.state.start("MainMenuState");
};
