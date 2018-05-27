'use strict';

const path = require('path');
const fs = require('fs');

const EventEmitter = require('events');

const util = require('../util.js');

const Tilemap = require('./tilemap.js');
const ObjectContainer = require('./object_container.js');

const Player = require('../objects/player.js');
const Chest = require('../objects/chest.js');
const Tree = require('../objects/tree.js');

const {Tiles, WorldConfig} = require('../../shared/constant.js');
const logger = require('../logger.js');

/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
class World {
  /**
   * @param server{Server}
   * @param filename {String=}
   */
  constructor(server, filename) {
    /**
     * @type {Server}
     */
    this.server = server;

    /**
     * @constant
     * @type {Number} World width.
     */
    this.width = WorldConfig.WIDTH;

    /**
     * @constant
     * @type {Number} World height.
     */
    this.height = WorldConfig.HEIGHT;

    /**
     * @type {Number} Counter for game ticks since game clock tarted.
     */
    this.stepCount = 0;

    /**
     * @type {Map<Number, Character>}
     */
    this.players = new Map();

    /**
     * @type {ObjectContainer}
     */
    this.objectContainer = new ObjectContainer(this);

    /**
     * @type {Tilemap} an tilemap object containing data of how tiles are
     * distributed.
     */
    this.tilemap = null;

    /**
     * @type {World.WEATHER|number}
     */
    this.currentWeather = World.WEATHER.DRY;

    /**
     * @type {number}
     */
    this.weatherCount = 0;

    this.weatherDuration = WorldConfig.WEATHER_DURATION;

    this.initWorldData(filename);
    this.setupEventEmitter();
  }

  /**
   * Initialized the game world either by existing data or generate new.
   * @param filename {String=}
   * @return {boolean}
   */
  initWorldData(filename = null) {
    logger.info('Creating new Tilemap...');

    this.tilemap = new Tilemap(this);
    this.spawnTrees();
    this.spawnChests();
  }

  /**
   * Register handlers for an event
   * @private
   */
  setupEventEmitter() {
    const emitter = new EventEmitter();

    /**
     * @type {Function}
     */
    this.on = emitter.on;

    /**
     * @type {Function}
     */
    this.once = emitter.once;
    this.removeListener = emitter.removeListener;

    this.emit = emitter.emit;
  }

  /**
   * Save a world snapshot to the local disk.
   */
  saveWorldDataToDisk() {
    let d = new Date();
    let filename = `world-${d.getDay()}-${d.getHours()}-${d.getSeconds()}.json`;
    let resolvedPath = path.join(__dirname, '../../data', filename);
    let data = JSON.stringify(this.tileMap);

    fs.writeFile(resolvedPath, data, (err) => {
      if (err) {
        return logger.error(`Unable to Save world data: ${resolvedPath}`);
      }
      logger.info(`World snapshot saved: ${resolvedPath}`);
    });
  }

  /**
   * @param filename {String}
   * @return {Array.<Array.<Number>>}
   */
  loadFromDiskData(filename) {
    let resolvedPath = path.join(__dirname, '../../data', filename);

    let mapData = null;

    try {
      mapData = JSON.parse(fs.readFileSync(resolvedPath));
    } catch (err) {
      logger.error(`Unable to Read world data: ${resolvedPath}`);
      logger.error(err);
    }

    return mapData;
  }

  /**
   * @private
   */
  spawnChests() {
    this.chestObjects = [];
    let newX;
    let newY;

    // TODO: Very bad implementation
    for (let i = 0; i < 50; ++i) {
      do {
        newX = Math.floor(Math.random() * this.width);
        newY = Math.floor(Math.random() * this.height);
      } while (!this.isPassable(newX, newY, 2));

      let chest = new Chest(this, newX, newY);
      this.chestObjects.push(chest);
      this.objectContainer.add(chest);
      logger.debug(`chest spawned at (${newX},${newY}).`);
    }

    this.objectContainer.debugPrint();
  }

  /**
   * Spawns trees around the world based on a given tilemap.
   * Will spawn trees on grass tiles only.
   */
  spawnTrees() {
    // TODO use a better algorithm to spawn trees
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let tileType = this.tilemap.getTileAt(x, y);
        if (tileType === Tiles.GRASS) { // grass
          if (Math.random() < 0.2) {
            // Set the object type as a tree
            let tree = new Tree(this, x, y);
            this.objectContainer.add(tree);
          }
        }
      }
    }
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @param playerId {Number}
   * @return {Map<Number, Character>}
   */
  addPlayer(x, y, playerId) {
    let player = new Player(this, x, y, playerId);
    return this.players.set(playerId, player);
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @param tileId {Number} Tile Enum
   */
  changeTile(x, y, tileId = Tiles.GRASS) {
    if (!this.isValidTile(x, y)) {
      logger.error(`Invalid tile position at (${x},${y})`);
      return;
    }

    logger.debug(`Tile at (${x}, ${y}) is changed to ${tileId}.`);

    if (this.tilemap.getTileAt(x, y) !== tileId) {
      this.tilemap.setTile(x, y, tileId);

      this.server.io.emit('worldUpdate', {
        tiles: [[x, y, tileId]],
      });
    }
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
   * @param x {number}
   * @param y {number}
   * @param d {number} Direction
   * @return {boolean}
   */
  isPassable(x, y, d) {
    return this.tilemap.checkPassage(x, y, 1 << d / 2 - 1 & 0x0f)
      && !this.checkObjectCollision(x, y);
  }

  checkObjectCollision(x, y) {
    return !!this.objectContainer.colliding(x, y);
  }

  /**
   * @param playerId {Number}
   * @return {boolean}
   */
  removeObject(playerId) {
    return this.players.delete(playerId);
  }

  /**
   * @return {Array.<Array.<Number>>}
   */
  getTileMap() {
    return this.tilemap.getData();
  }

  /**
   * @deprecated
   * @return {Array.<Tree>}
   */
  getTreePosArray() {
    return this.objectContainer.getObjects('tree');
  }

  /**
   * @deprecated
   * @return {Array.<Chest>}
   */
  getChestPosArray() {
    return this.objectContainer.getObjects('chest');
  }

  /**
   * Main Update function
   * @param dt{Number}
   */
  step(dt) {
    // update all players.
    this.players.forEach((character) => {
      character.update();
    });

    // update weather
    this.weatherCount += dt;
    if (this.weatherCount >= this.weatherDuration) {
      this.weatherCount = 0;

      this.currentWeather = util.pick([
        World.WEATHER.DRY,
        World.WEATHER.RAIN,
        World.WEATHER.BLIZZARD,
        World.WEATHER.SANDSTORM,
      ]);

      this.emit('weatherChange', this.currentWeather);

      // TODO: Refactor
      this.server.io.emit('weatherChange', this.currentWeather);

      logger.data(`World Weather has changed to ${this.currentWeather}.`);
    }
  }

  /**
   * @param command {Function} Command Function
   */
  processInput(command) {
    command();
  }
}

/**
 * @const
 * @enum
 * @type {{DRY: number, RAIN: number, BLIZZARD: number, SANDSTORM: number}}
 */
World.WEATHER = {
  DRY: 0,
  RAIN: 1,
  BLIZZARD: 2,
  SANDSTORM: 3,
};

module.exports = World;
