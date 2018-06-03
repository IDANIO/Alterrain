'use strict';

const logger = require('../logger.js');
const GameObject = require('./game_object');

const {TileSpeed, Tiles} = require('../../shared/constant.js');

class Character extends GameObject {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    this._realX = this._x;
    this._realY = this._y;

    /**
     * @type {number} 2 = Down, 4 = Left, 6 = Right, 8 = Up
     * @private
     */
    this._direction = 2;
    this._moveSpeed = 5;

    this._speedFactor = 1;
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
   * @param d {Number}
   */
  setDirection(d) {
    this._direction = d;
  }

  /**
   * @param d {number}
   * @return {number}
   */
  reverseDir(d) {
    return 10 - d;
  }

  update() {
    if (this.isMoving()) {
      const terrainID = this.world.tilemap.getTileAt(this._x, this._y);
      this._moveSpeed = TileSpeed[terrainID];

      this.updateMove();
    }
  }

  updateMove() {
    if (this._x < this._realX) {
      this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
    }
    if (this._x > this._realX) {
      this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
    }
    if (this._y < this._realY) {
      this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
    }
    if (this._y > this._realY) {
      this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
    }
  }

  /**
   * @param x {number}
   * @param y {number}
   * @param d {number}
   * @return {boolean}
   */
  canPass(x, y, d) {
    let x2 = Character.roundXWithDirection(x, d);
    let y2 = Character.roundYWithDirection(y, d);
    if (!this.world.isValidTile(x2, y2)) {
      return false;
    }
    if (!this.isMapPassable(x, y, d)) {
      return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
      return false;
    }
    return true;
  }

  /**
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  isCollidedWithCharacters(x, y) {
    return false;
  }

  /**
   * @param x {number}
   * @param y {number}
   * @param d {number}
   * @return {boolean}
   */
  isMapPassable(x, y, d) {
    let x2 = Character.roundXWithDirection(x, d);
    let y2 = Character.roundYWithDirection(y, d);
    let d2 = this.reverseDir(d);
    return this.world.isValidTile(x2, y2) &&
            this.world.isPassable(x, y, d) &&
            this.world.isPassable(x2, y2, d2);
  }

  /**
   * @param x
   * @param d
   * @return {number}
   */
  static roundXWithDirection(x, d) {
    return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
  }

  /**
   * @private
   * @return {number}
   */
  realMoveSpeed() {
    return this._moveSpeed;
    // return this._moveSpeed * this._speedFactor;
  }

  /**
   * @return {number}
   */
  distancePerFrame() {
    return Math.pow(2, this.realMoveSpeed()) / 256;
  }

  /**
   * @return {boolean}
   */
  isMoving() {
    return this._realX !== this._x || this._realY !== this._y;
  }

  /**
   * @param y
   * @param d
   * @return {number}
   */
  static roundYWithDirection(y, d) {
    return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
  }

  /**
   * @param d {Number}
   */
  moveStraight(d) {
    this.setDirection(d);

    // Check can pass this terrain?
    if (this.canPass(this._x, this._y, this._direction)) {
      this._x = Character.roundXWithDirection(this._x, d);
      this._y = Character.roundYWithDirection(this._y, d);
    }

    logger.debug(`Player moved to (${this._x}, ${this._y}) facing ${d}`);
  }

  serialize() {
    return `${this._realX} ${this._realY} ${this._direction}`;
  }
}

module.exports = Character;
