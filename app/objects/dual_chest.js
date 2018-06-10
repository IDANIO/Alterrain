'use strict';

const Chest = require('../objects/chest.js');

class DualChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    let half = Math.floor(this.world.players.size / 2);
    this.playerRequired = Math.min(5, Math.max(2, half));
  }

  onOpened(player) {
    let success = 0; //0 = new player looted
    // if this player is recorded in the history.
    let index = this.playerHistory.indexOf(player.id);
    if (index !== -1) {
      this.awardPlayer(player);

      this.playerHistory.splice(index, 1);
    }
    else{
        success = 1; //1 = old player failed to loot
    }

    if (this.playerHistory <= 0) {
      this.state = Chest.STATE_LOOTED;
      success = 2; //2 = last player looted
    }
    return success;
  }
}

module.exports = DualChest;
