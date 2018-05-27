var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var game;
var mainMenuState;
var gameplayState;
var controlsState;

window.onload = function(){
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);

    mainMenuState = new MainMenuState(game);
    gameplayState = new GameplayState(game);
    controlsState = new ControlsState(game);

    //Add the states to the state manager
    game.state.add("MainMenuState", mainMenuState);
    game.state.add("GameplayState", gameplayState);
    game.state.add("ControlsState", controlsState);

    game.state.start("MainMenuState");
};
