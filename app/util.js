'use strict';

/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2015 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

module.exports = {
  /**
   * Returns a random integer between and including min and max.
   *
   * @param {number} min - The minimum value in the range.
   * @param {number} max - The maximum value in the range.
   * @return {number} A random number between min and max.
   */
  integerInRange: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  /**
   * Returns a random member of `array`.
   *
   * @param {Array} ary - An Array to pick a random member of.
   * @return {any} A random member of the array.
   */
  pick: function(ary) {
    return ary[this.integerInRange(0, ary.length - 1)];
  },
};
