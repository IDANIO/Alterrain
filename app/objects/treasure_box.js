'use strict';

const logger = require('../logger.js');
const GameObject = require('../objects/game_object');
const {Tiles} = require('../../shared/constant.js');

class TreasureBox extends GameObject {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    this.state = TreasureBox.STATE_LOCKED;

    this.loots = [];
    this.playerRequired = 2;
    this.playerOpened = [];
  }

  /**
   * @param player
   * @return {boolean}
   */
  isNewPlayer(player) {
    return !this.playerOpened.includes(player.id);
  }

  /**
   * @param player {Player} the player who interacts with this object.
   */
  onInteraction(player) {
    switch (this.state) {
      case TreasureBox.STATE_LOCKED:
        this.onClosed(player);
        break;
      case TreasureBox.STATE_UNLOCK:
        this.onUnlock(player);
        break;
      case TreasureBox.STATE_OPENED:
        this.onOpened(player);
        break;
    }

    // Emit Treasure box state Update ?
    // TODO: Refactor
    this.world.server.io.emit('chestUpdate', {
      x: this._x,
      y: this._y,
      state: this.state,
    });
  }

  onClosed(player) {
    logger.data(`Player ${player.id} is interacting Box (state ${this.state})`);

    this.state = TreasureBox.STATE_UNLOCK;

    this.onUnlock(player);
  }

  onUnlock(player) {
    logger.data(`Player ${player.id} is interacting Box (state ${this.state})`);

    if (this.isNewPlayer(player)) {
      this.playerRequired--;
      this.playerOpened.push(player.id);
    }

    if (this.playerRequired <= 0) {
      this.state = TreasureBox.STATE_OPENED;
    }
  }

  onOpened(player) {
    logger.data(`Player ${player.id} is interacting Box (state ${this.state})`);

    // Reward the player
    player.gainItem(Tiles.STONE);

    // Emit itemUpdate msg to client ?
  }
}

TreasureBox.STATE_LOCKED = 0;
TreasureBox.STATE_UNLOCK = 1;
TreasureBox.STATE_OPENED = 2;

module.exports = TreasureBox;
