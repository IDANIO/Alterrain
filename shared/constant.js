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
  WIDTH: 88,
  HEIGHT: 88,
  WEATHER_DURATION: (60 * 1000), // 1 min in millisecond
};

