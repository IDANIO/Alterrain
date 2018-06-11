/**
 * @constant
 * @enum
 */
exports.Commands = {
  NULL: 0,
  MOVEMENT: 1,
  ALTER_TILE: 2,
  COMMUNICATION: 3,
  INTERACTION: 4,
};

/**
 * @constant
 * @enum
 */
exports.Tiles = {
  // NULL: 0,
  GRASS: 0,
  SAND: 1,
  STONE: 2,
  WATER: 3,
  BRIDGE: 4,
  FOREST: 5,
  SNOW: 6,
  DESERT: 7,
  ICE: 8,
  COBBLESTONE: 9,
};

/**
 * @constant
 */
exports.TileData = [
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
];

/**
 * @constant
 */
exports.TileSpeed = [
  4.5,
  4.5,
  4.5,
  0,
  4.5,
  4.5,
  4.5,
  4,
  4.5,
  4.5,
];

/**
 * @constant
 */
exports.ServerConfig = {
  MAX_PLAYERS: 50,
  STEP_RATE: 60,
  TIMEOUT_INTERVAL: 60 * 30, // 30 minutes
};

/**
 * @constant
 */
exports.WorldConfig = {
  WIDTH: 88,
  HEIGHT: 88,
  WEATHER_DURATION: (45 * 1000), // in millisecond
  // MAX_TREES: 400,
  // we don't need this any more, the max number of trees is the number of
  // trees in the start of the game.

  TREE_GEN_SPEED: 50, // Each time the rain stops, chance trees
                     // instantly generate.
                     // the higher the higher chance to gen more
                     // tress. you can try play around with it and see what
                     // value you like. you can make the weather duration
                     // shorting during testing.
};

