'use strict';

const logger = require('../logger.js');
const util = require('../util.js');
const GameObject = require('../objects/game_object');
const {Tiles} = require('../../shared/constant.js');

class Chest extends GameObject {
  constructor(world, x, y) {
    super(world, x, y);
    this.type = 'chest';

    this.state = Chest.STATE_LOCKED;

    this.loots = [Tiles.GRASS, Tiles.STONE, Tiles.SAND, Tiles.FOREST, Tiles.SNOW, Tiles.DESERT];
    this.playerRequired = 1;
    this.playerHistory = [];
  }

  /**
   * @return {boolean}
   */
  canOpen() {
    return this.playerRequired <= 0;
  }

  /**
   * @param player
   */
  awardPlayer(player) {
    let item = util.pick(this.loots);
    player.gainItem(item, util.integerInRange(4, 12));
  }

  /**
   * @param player
   * @return {boolean}
   */
  isNewPlayer(player) {
    return !this.playerHistory.includes(player.id);
  }

  /**
   * @param player {Player} the player who interacts with this object.
   */
  onInteraction(player) {
    logger.debug(`Player ${player.id} is interacting Box \
      (state ${this.state})`);

    switch (this.state) {
      case Chest.STATE_LOCKED:
        this.onClosed(player);
        break;
      case Chest.STATE_UNLOCK:
        this.onUnlock(player);
        break;
      case Chest.STATE_OPENED:
        this.onOpened(player);
        break;
      case Chest.STATE_LOOTED:
        this.onLooted(player);
        break;
    }

    // TODO: Refactor
    this.world.server.io.emit('chestUpdate', {
      x: this._x,
      y: this._y,
      state: this.state,
    });
  }

  /**
   * @param player {Player}
   */
  onClosed(player) {
    this.state = Chest.STATE_UNLOCK;

    this.onUnlock(player);
  }

  /**
   * @param player {Player}
   */
  onUnlock(player) {
    if (this.isNewPlayer(player)) {
      this.playerRequired--;
      this.playerHistory.push(player.id);
    }

    if (this.canOpen()) {
      this.state = Chest.STATE_OPENED;
    }
  }

  /**
   * @param player {Player}
   */
  onOpened(player) {
    this.awardPlayer(player);

    this.state = Chest.STATE_LOOTED;
  }

  /**
   * @param player {Player}
   */
  onLooted(player) {
  }
}

Chest.STATE_LOCKED = 0;
Chest.STATE_UNLOCK = 1;
Chest.STATE_OPENED = 2;
Chest.STATE_LOOTED = 3;

module.exports = Chest;
