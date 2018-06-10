var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var game;
var mainMenuState;
var gameplayState;
var controlsState;

window.onload = function(){
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO);

    //Create the state objects
    mainMenuState = new MainMenuState(game);
    gameplayState = new GameplayState(game);
    controlsState = new ControlsState(game);

    //Add the states to the state manager
    game.state.add("MainMenuState", mainMenuState);
    game.state.add("GameplayState", gameplayState);
    game.state.add("ControlsState", controlsState);

    game.state.start("MainMenuState");
};

//Disable scrolling code from:
//https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);