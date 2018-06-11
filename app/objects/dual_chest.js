'use strict';

const Chest = require('../objects/chest.js');

class DualChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    let half = Math.floor(this.world.players.size / 2);
    this.playerRequired = Math.min(5, Math.max(2, half));
  }

  onOpened(player) {
    let success = 0; // 0 = new player looted
    // if this player is recorded in the history.
    let index = this.playerHistory.indexOf(player.id);
    if (index !== -1) {
      this.awardPlayer(player);
      this.success = true;
      this.playerHistory.splice(index, 1);
    } else {
        success = 1; // 1 = old player failed to loot
    }

    if (this.playerHistory <= 0) {
      this.state = Chest.STATE_LOOTED;
      success = 2; // 2 = last player looted
    }
    return success;
  }

  /**
   * @param player {Player} the player who interacts with this object.
   */
  onInteraction(player) {
    // Very ugly way of fixing sound bug
    let success = 2;

    switch (this.state) {
      case Chest.STATE_LOCKED:
        this.onClosed(player);
        break;
      case Chest.STATE_UNLOCK:
        this.onUnlock(player);
        break;
      case Chest.STATE_OPENED:
        success = this.onOpened(player);
        break;
      case Chest.STATE_LOOTED:
        this.onLooted(player);
        break;
    }

    if (success === 0) {
      this.world.server.io.emit('chestUpdate', {
        x: this._x,
        y: this._y,
        state: 4,
        playerRequired: this.playerRequired,
      });
    } else if (success === 1) {
      this.world.server.io.emit('chestUpdate', {
        x: this._x,
        y: this._y,
        state: 5,
        playerRequired: this.playerRequired,
      });
    } else if (success === 2) {
      // TODO: Refactor
      this.world.server.io.emit('chestUpdate', {
        x: this._x,
        y: this._y,
        state: this.state,
        playerRequired: this.playerRequired,
      });
    }
  }
}

module.exports = DualChest;
