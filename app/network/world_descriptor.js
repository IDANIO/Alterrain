'use strict';

/**
 * @param world {World}
 * @return {string}
 */
module.exports = (world) => {
  let str = '';

  world.players.forEach((player) => {
    str += `${player.serialize()}|`;
  });

  return str;
};
