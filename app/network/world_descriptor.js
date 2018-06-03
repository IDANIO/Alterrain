/**
 * @param world {World}
 * @return {string}
 */
module.exports = (world) => {
  let str = '';

  world.players.forEach((player) => {
    str += `${
      player.id
    } ${
      player._realX
    } ${
      player._realY
    } ${
      player._direction
    }|`;
  });

  return str;
};
