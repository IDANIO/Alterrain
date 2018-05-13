'use strict';

const EventEmitter = require('events');
const Noise = require('noisejs');
const Player = require('./player.js');

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

    this.width = WorldConfig.WIDTH;
    this.height = WorldConfig.HEIGHT;

    this.initTilemap();

    this.setupEventEmitter();
    this.on('server__processInput', (input, playerId) => {
      this.processInput(input, playerId);
    });
  }

  /**
   * @private
   */
  initTilemap() {
    // The game world represented in a 2D array
    // 0 = grass
    // 1 = sand
    // 2 = stone - temp
    // 3 = water - can not pass
    this.tileMap = [];

    // The heightmap, used to procedurally generate
    // the tilemap
    this.heightmap = [];
    for (let i = 0; i < this.height; i++) {
      this.tileMap[i] = [];
      this.heightmap[i] = [];
    }

    this.generateNoise(this.heightmap, this.width, this.height);
    this.generateTileMap(this.tileMap, this.heightmap);
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
    let player = new Player(this, 5, 5, playerId);
    return this.objects.set(playerId, player);
  }

  /**
   * temp
   * @deprecated
   * TODO: Make it proper
   */
  changeTile(x, y, tileId = 2) {
    if (!this.isValidTile(x, y)) {
      logger.error(`Invalid tile position at (${x},${y})`);
      return;
    }

    logger.debug(`Tile at (${x}, ${y}) is changed to ${tileId}.`);

    this.tileMap[x][y] = tileId;

    this.server.io.emit('worldUpdate', {
      tiles: [[x, y, 2]],
    });
  }

  /**
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  isValidTile(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * @param playerId {Number}
   * @return {boolean}
   */
  removeObject(playerId) {
    return this.objects.delete(playerId);
  }

  /**
   * @return {Array}
   */
  getTileMap() {
    return this.tileMap;
  }

  /**
   * Main Update function
   * @param dt{Number}
   */
  step(dt) {

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

module.exports = World;
