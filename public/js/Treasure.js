// Treasure constructor
function Treasure(game, x, y, key, frame) {
    // Call to Phaser.Sprite(game, x, y, key, frame)
    Phaser.Sprite.call(this, game, x, y, key, frame);

    // Default - require 1 player only to open
    this.numPlayersRequired = 1;
    this.frame = 1;

    // Lock count text above treasure chest
    this.lockCountText = game.add.bitmapText(x + 2, y - 12, 'm5x7', '1x', 24);
    this.lockCountText.tint = 0xffc825;
    this.lockIcon = game.add.sprite(x + 22, y - 12, 'lockIcon');
    this.lockBackground = game.add.sprite(x, y - 14, 'lockBackground');

    // Loot particles
    this.lootEmitter = game.add.emitter(x + 16, y + 14);
    this.lootEmitter.makeParticles('tileSpritesheet', [0, 1, 2, 5, 6, 7, 8], 16);
    this.lootEmitter.gravity = 128;
    this.lootEmitter.setXSpeed(-48, 48);
    this.lootEmitter.setYSpeed(-64, -32);
    this.lootEmitter.setScale(0.25, 0.25, 0.25, 0.25);
}

Treasure.prototype = Object.create(Phaser.Sprite.prototype);
Treasure.prototype.constructor = Tree;

Treasure.prototype.setSize = function(size) {
    if (size > 0) {
        this.numPlayersRequired = size;
        // this.frame = size + 1;
        this.frame = 2;
        this.lockCountText.text = size + 'x';
    }
};

Treasure.prototype.update = function() {
    // Hacky way to keep the correct display counter
    if (this.lockCountText.text != this.numPlayersRequired + 'x') {
        this.lockCountText.text = this.numPlayersRequired + 'x';
    }
};

Treasure.prototype.setState = function(state) {
    if (state === 3) {
        this.frame = 0;
        this.lootEmitter.on = false;
        this.lockCountText.destroy();
        this.lockIcon.destroy();
        this.lockBackground.destroy();
    } else if (state === 2) {
        this.frame = 1;
        this.lootEmitter.start(false, 500, 250);
        this.lockCountText.destroy();
        this.lockIcon.destroy();
        this.lockBackground.destroy();
    } else if (state === 1 || state === 0) {
        this.frame = 2;
    }
};

// Set whether the treasure chest should be hidden or not
Treasure.prototype.setHidden = function(flag) {
    this.hidden = flag;
    if (this.hidden) {
        this.alpha = 0;
    } else {
        this.alpha = 1;
    }
};

// Called when the last lock is unlocked in this treasure chest
Treasure.prototype.open = function() {
    this.frame = 1;
    this.lootEmitter.start(false, 500, 250);
    this.lockCountText.destroy();
    this.lockIcon.destroy();
    this.lockBackground.destroy();
};

// ---Cut feature---
Treasure.prototype.digUp = function() {
    this.setHidden(false);
};

// Unlock one lock in this treasure chest
Treasure.prototype.unlockOnce = function() {
    // this.frame--;
    this.numPlayersRequired--;
    this.lockCountText.text = this.numPlayersRequired + 'x';
};
