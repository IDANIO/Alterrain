'use strict';

const logger = require('../logger.js');

class Character {
  constructor(x = 0, y = 0) {
    /**
     * @type {number}
     * @private
     */
    this._x = x;

    /**
     * @type {number}
     * @private
     */
    this._y = y;

    /**
     * @type {number} 2 = Down, 4 = Left, 6 = Right, 8 = Up
     * @private
     */
    this._direction = 2;
    this._moveSpeed = 4;
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
   * @return {number}
   */
  moveSpeed() {
    return this._moveSpeed;
  }

  /**
   * @param moveSpeed {Number}
   */
  setMoveSpeed(moveSpeed) {
    this._moveSpeed = moveSpeed;
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
   * @param other {Character}
   */
  copyPosition(other) {
    this.setPosition(other._x, other._y);
  }

  /**
   * @param direction {Number}
   */
  moveStraight(direction) {
    // Check cold down to move?

    // Check can pass this terrain?

    this._x = Character.roundXWithDirection(this._x, direction);
    this._y = Character.roundYWithDirection(this._y, direction);

    logger.debug(`Player moved to (${this._x}, ${this._y})`);
  }

  /**
   * @private
   * @param x
   * @param d
   * @return {*}
   */
  static roundXWithDirection(x, d) {
    return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
  }

  /**
   * @private
   * @param y
   * @param d
   * @return {*}
   */
  static roundYWithDirection(y, d) {
    return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
  }
}

module.exports = Character;
