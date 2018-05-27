'use strict';

class GameObject {
  constructor(world, x, y) {
    /**
     * @type {World}
     */
    this.world = world;

    /**
     * @abstract
     * @type {String}
     */
    this.type = null;

    /**
     * @type {Number}
     * @private
     */
    this._x = x;

    /**
     * @type {Number}
     * @private
     */
    this._y = y;
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @return {boolean}
   */
  pos(x, y) {
    return this._x === x && this._y === y;
  }

  /**
   * @param x {Number}
   * @param y {Number}
   */
  setPosition(x, y) {
    this._x = Math.round(x);
    this._y = Math.round(y);
  }

  /**
   * @param other {GameObject}
   */
  copyPosition(other) {
    this.setPosition(other._x, other._y);
  }

  /**
   * Called when the game world steps.
   * @param {Number} dt
   */
  onUpdate(dt) { }

  /**
   * Called when the object is spawned to the world.
   */
  onObjectSpawn() { }

  /**
   * Called when the object is triggered by a player.
   * @param player {Player}
   */
  onInteraction(player) { }
}

module.exports = GameObject;
