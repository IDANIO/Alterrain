const Character = require('./character.js');
const {Tiles} = require('../../shared/constant.js');

/**
 * @instance
 * @type {{makeMoveCommand: function(Character, Number): Function,
 * makeChangeTileCommand: function(Character, {tileId}): Function,
 * makeCommunicateCommand: function(Character, Object): Function}}
 */
const CommandFactory = {
  /**
   * @param player {Character | Player}
   * @param params {Number}
   * @return {Function}
   */
  makeMoveCommand: (player, params = 2) => {
    let dir = params;
    return ()=>{
      if (!player.isMoving()) {
        player.moveStraight(dir);
        player.world.server.io.emit('playerUpdate', {
          id: player.id,
          x: player._x,
          y: player._y,
          d: player._direction,
        });
      }
    };
  },

  /**
   * @param player {Character}
   * @param params {Object}
   * @param params.tileId {Number}
   * @return {Function}
   */
  makeChangeTileCommand: (player, params) => {
    let tileId = params.tileId;
    let x2 = Character.roundXWithDirection(player._x, player._direction);
    let y2 = Character.roundYWithDirection(player._y, player._direction);
    return ()=>{
      player.world.changeTile(x2, y2, tileId);
      // Temp, should not emit at here
    };
  },

  /**
   * @param player {Character}
   * @param params {Object}
   * @return {Function}
   */
  makeCommunicateCommand: (player, params) => {
    return ()=>{
      // Temp, should not emit at here
      player.world.server.io.emit('playSound', {
        x: player._x,
        y: player._y,
      });
    };
  },
};

module.exports = CommandFactory;
