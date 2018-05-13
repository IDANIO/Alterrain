'use strict';

const EventEmitter = require('events');
const Character = require('./character');
const {WorldConfig} = require('../../shared/constant.js');
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
     * @type {Map<Number, Character>}
     */
    this.objects = new Map();
    this.stepCount = 0;

    // The game world represented in a 2D array
    // 0 = grass
    // 1 = sand
    // 2 = stone - temp
    // 3 = water - can not pass
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

    this.setupEventEmitter();
    this.on('server__processInput', (input, playerId)=>{
      this.processInput(input, playerId);
    });
  }

  /**
   * Register handlers for an event
   * @private
   */
  setupEventEmitter() {
    let emitter = new EventEmitter();

    this.on = emitter.on;
    this.once = emitter.once;
    this.removeListener = emitter.removeListener;

    this.emit = emitter.emit;
  }

  /**
   * @param playerId {Number}
   * @return {Map<Number, Character>}
   */
  addObject(playerId) {
    let character = new Character(5, 5);
    return this.objects.set(playerId, character);
  }

  /**
   * temp
   * @deprecated
   * TODO: Make it proper
   */
  changeTile(x, y, tileId = 2) {
    x = Math.floor(x/32);
    y = Math.floor(y/32);
    // Check array index out of bounds
    if (x < 0 || x >= World.MAP_WIDTH || y < 0 || y >= World.MAP_HEIGHT) {
      logger.debug(`Invalid tile position at (${x},${y})`);
    } else {
      this.tileMap[x][y] = tileId;
      this.server.io.emit('worldUpdate', {
        tiles: [[x, y, 2]],
      });
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

  /**
   * @param inputMsg {Object}
   * @param inputMsg.input {}
   * @param playerId {Number}
   */
  processInput(inputMsg, playerId) {
    logger.debug(`game engine processing input \
<${inputMsg.input}> from playerId ${playerId}`);
  }
}

World.MAP_WIDTH = 64;
World.MAP_HEIGHT = 64;

module.exports = World;
