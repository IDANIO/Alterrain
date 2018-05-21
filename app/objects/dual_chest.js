'use strict';

const Chest = require('../objects/chest.js');

class DualChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    this.playerRequired = 2;
  }

  /**
   * @override
   * @param player
   */
  onUnlock(player) {

  }

  onOpened(player) {

  }

  onLooted(player) {

  }
}

module.exports = DualChest;
