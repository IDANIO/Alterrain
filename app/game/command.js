/**
 * @instance
 * @type {{makeMoveCommand: function((Character|Player), Number=): Function,
 * makeChangeTileCommand: function(Player, {tileId}):
 * Function, makeCommunicateCommand: function(Player, Object): Function,
 * makeInteractCommand: function(Player, Object): Function}}
 */
const CommandFactory = {
  /**
   * @param player {Character || Player}
   * @param params {Number}
   * @return {Function}
   */
  makeMoveCommand: (player, params = 2) => {
    let dir = params;
    return () => {
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
   * @param player {Character || Player}
   * @param params {Object}
   * @param params.tileId {Number}
   * @return {Function}
   */
  makeChangeTileCommand: (player, params) => {
    let tileId = params.tileId;
    return () => {
      player.placeTile(tileId);
    };
  },

  /**
   * @param player {Character || Player}
   * @param params {Object}
   * @return {Function}
   */
  makeCommunicateCommand: (player, params) => {
    return () => {
      // Temp, should not emit at here
      player.world.server.io.emit('playSound', {
        id: player.id,
      });
    };
  },

  /**
   * @param player {Character || Player}
   * @param params {Object}
   * @return {Function}
   */
  makeInteractCommand: (player, params) => {
    return () => {
      player.onInteraction(player);
    };
  },
};

module.exports = CommandFactory;
