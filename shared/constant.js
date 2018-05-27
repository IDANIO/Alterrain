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
];

/**
 * @constant
 */
exports.ServerConfig = {
  MAX_PLAYERS: 50,
  STEP_RATE: 60,
};

/**
 * @constant
 */
exports.WorldConfig = {
  WIDTH: 128,
  HEIGHT: 128,
  WEATHER_DURATION: (1000), // 3 min in millisecond
};

