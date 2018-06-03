'use strict';

const Chest = require('../objects/chest.js');

class DualChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    this.playerRequired = 2;
  }

  onInteraction(...args) {
    super.onInteraction(...args);
  }

  onUnlock(...args) {
    super.onUnlock(...args);
  }

  onOpened(player) {

  }

  onLooted(player) {

  }
}

module.exports = DualChest;
