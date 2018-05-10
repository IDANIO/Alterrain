'use strict';

const logger = require('../logger.js');

/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
class World {
  /**
   * @param server{Server}
   */
  constructor(server) {
    this.server = server;

    /**
     * @type {Map<Number, Object>}
     */
    this.objects = new Map();
    this.stepCount = 0;

    // The game world represented in a 2D array
    // 0 = grass
    // 1 = sand
    // 2 = stone - temp
    this.tileMap = [];

    // The heightmap, used to procedurally generate
    // the tilemap
    this.heightmap = [];
    for (let i = 0; i < World.MAP_HEIGHT; i++) {
      this.tileMap[i] = [];
      this.heightmap[i] = [];
    }

    this.generateNoise(this.heightmap, World.MAP_WIDTH, World.MAP_HEIGHT);
    this.generateTileMap(this.tileMap, this.heightmap);
  }

  /**
   * @param playerId {Number}
   * @return {Map<Number, Object>}
   */
  addObject(playerId) {
    return this.objects.set(playerId, {
      id: playerId,
      x: 64,
      y: 64,
    });
  }

  /**
   * temp
   * @deprecated
   * TODO: Make it proper
   */
  changeTile(x, y) {
    x = Math.floor(x/16);
    y = Math.floor(y/16);
    //Check array index out of bounds
    if(x < 0 || x >= World.MAP_WIDTH || y < 0 || y >= World.MAP_HEIGHT){
      logger.debug("Invalid tile position at (${x},${y})");
    }
    else{
      this.tileMap[x][y] = 2;
      this.server.io.emit('worldUpdate', {
        tiles: [x, y, 2],
      });
      logger.debug("Tile changed at (${x},${y})");    
    }
  }

  /**
   * @param playerId {Number}
   * @return {boolean}
   */
  removeObject(playerId) {
    return this.objects.delete(playerId);
  }

  getObjects() {
    return this.objects.values();
  }

  /**
   * @return {Array}
   */
  getTileMap() {
    return this.tileMap;
  }

  step(dt) {

  }

  /**
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param elevation The 2D array that represents the elevation
   * @param moisture The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
  getBiomeType(elevation, moisture) {
    // TODO properly check the terrain type
    if (elevation < 0.5) {
      return 0;
    } else {
      return 1;
    }
  }

  /**
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param arr The 2D array to fill
   * @param width The width of the 2D array
   * @param height The height of the 2D array
   */
  generateNoise(arr, width, height) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        // TODO use an actual noise function
        arr[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  /**
   * Creates the tilemap of the game world based on different
   * layers of noise
   * @param tilemap The 2D array to generate tiles in
   * @param heightmap A 2D array of noise representing elevation
   */
  generateTileMap(tilemap, heightmap) {
    // TODO properly generate the tilemap based on the heightmap
    // layer and other layers
    for (let i = 0; i < tilemap.length; i++) {
      for (let j = 0; j < tilemap.length; j++) {
        let e = heightmap[i][j];
        let tileType = this.getBiomeType(e, 0);
        tilemap[i][j] = tileType;
      }
    }
  }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

World.MAP_WIDTH = 64;
World.MAP_HEIGHT = 64;

module.exports = World;
