'use strict';

const Chest = require('../objects/chest.js');

class DualChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    let half = Math.floor(this.world.players.size / 2);
    this.playerRequired = Math.min(5, Math.max(2, half));
  }

  onOpened(player) {
    // if this player is recorded in the history.
    let index = this.playerHistory.indexOf(player.id);
    if (index !== -1) {
      this.awardPlayer(player);
      this.success = true;
      this.playerHistory.splice(index, 1);
    }

    if (this.playerHistory <= 0) {
      this.state = Chest.STATE_LOOTED;
    }
  }
}

module.exports = DualChest;
