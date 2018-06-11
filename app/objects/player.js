'use strict';

const Character = require('./character.js');
const logger = require('../logger.js');
const {Tiles} = require('../../shared/constant.js');

class Player extends Character {
  constructor(world, x, y, id) {
    super(world, x, y);
    this.type = 'player';

    this.id = id;

    /**
     * Initialized to zero.
     * @type {Array.<Number>} Key: Tiles Enum. Value: item count.
     */
    this.inventory = Array(...Array(10)).map(Number.prototype.valueOf, 0);

    // Players start with 20 bridge tiles
    this.gainItem(Tiles.BRIDGE, 20);
  }

  /**
   * @param tileId {Number}
   * @param count {Number=}
   */
  gainItem(tileId, count = 1) {
    if (isValidItem(tileId)) {
      this.inventory[tileId] = Math.min(64, this.inventory[tileId] + count);
    }
    this.world.server.io.emit('inventoryUpdate', {
      id: this.id,
      inventory: this.inventory,
    });
  }

  /**
   * @param tileId {Number}
   * @param count {Number=}
   */
  loseItem(tileId, count = 1) {
    if (isValidItem(tileId)) {
      this.inventory[tileId] = Math.max(0, this.inventory[tileId] - count);
    }
    this.world.server.io.emit('inventoryUpdate', {
      id: this.id,
      inventory: this.inventory,
    });
  }

  /**
   * @param tileId {Number}
   * @return {boolean}
   */
  hasItem(tileId) {
    return isValidItem(tileId) && this.inventory[tileId];
  }

  /**
   * @param tileId {Number}
   */
  placeTile(tileId) {
    let newX = Character.roundXWithDirection(this._x, this._direction);
    let newY = Character.roundYWithDirection(this._y, this._direction);

    if (this.hasItem(tileId) &&
        this.world.isValidTile(newX, newY) &&
        this.tileTypeCheck(tileId, newX, newY) &&
        this.world.changeTile(newX, newY, tileId)) {
      this.loseItem(tileId);
    }
  }

  /**
   * @private
   * @param tileId
   * @param x
   * @param y
   */
  tileTypeCheck(tileId, x, y) {
    let targetTile = this.world.tilemap.getTileAt(x, y);
    let isValid = true;

    if (tileId !== Tiles.BRIDGE && tileId !== Tiles.ICE &&
      targetTile === Tiles.WATER ) {
      isValid = false;
    }

    if (tileId === Tiles.BRIDGE && targetTile !== Tiles.WATER ) {
      isValid = false;
    }

    if (!isValid) {
      this.world.server.io.emit('errorSound', {
        id: this.id,
      });
    }

    return isValid;
  }

  /**
   * @override
   * @param player
   */
  onInteraction(player) {
    let x2 = Character.roundXWithDirection(this._x, this._direction);
    let y2 = Character.roundYWithDirection(this._y, this._direction);

    let chest = this.world.objectContainer.colliding(x2, y2);
    if (chest) {
      chest.onInteraction(this);
    }
  }

  serialize() {
    return `${this.id} ${super.serialize()}`;
  }
}

/**
 * @param tileId
 * @return {boolean}
 */
function isValidItem(tileId) {
  return 0 <= tileId && tileId <= 9;
}

module.exports = Player;
