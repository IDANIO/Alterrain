// Pause UI constructor
function PauseUI(game, x, y) {
    this.game = game;
    this.x = x || 0;
    this.y = y || 0;
    this.paused = true;

    this.pauseBackground = game.add.sprite(x + GAME_WIDTH / 2, y + 190, 'pauseBackground');
    this.pauseBackground.anchor.setTo(0.5);
    this.pauseBackground.scale.setTo(2);

    // Instructions text for the UI
    this.promptText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 170, 'm5x7', 'Are you sure you want to quit?', 32);
    this.promptText.anchor.setTo(0.5);

    this.choiceText = game.add.bitmapText(x + GAME_WIDTH / 2, y + 220, 'm5x7', 'Y to confirm, Esc to cancel', 32);
    this.choiceText.anchor.setTo(0.5);
}

PauseUI.prototype.show = function() {
    this.paused = true;
    this.promptText.alpha = 1;
    this.choiceText.alpha = 1;
    this.pauseBackground.alpha = 1;
};

PauseUI.prototype.hide = function() {
    this.paused = false;
    this.promptText.alpha = 0;
    this.choiceText.alpha = 0;
    this.pauseBackground.alpha = 0;
};

PauseUI.prototype.destroy = function() {
    this.promptText.destroy();
    this.choiceText.destroy();
    this.pauseBackground.destroy();
};
