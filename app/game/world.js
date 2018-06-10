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
    this.setupEventEmitter();

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
    this.weatherCount = 0;
    this.weatherDuration = WorldConfig.WEATHER_DURATION;

    this.outgoingBuffer = [];

    this.treeGenChance = WorldConfig.TREE_GEN_SPEED;

    this.initWorldData(filename);

    this.on('objectRemoval', (obj) => {
      this.removeObject(obj);
    });

    this.on('playerSpawn', ()=>{
      this.onPlayerSpawn();
    });
  }

  /**
   * Initialized the game world either by existing data or generate new.
   * @param filename {String=}
   * @return {boolean}
   */
  initWorldData(filename = null) {
    logger.info('Creating new Tilemap...');

    this.tilemap = new Tilemap(this);
    this.initializeTrees();
    this.initializeChests();
  }

  /**
   * Register handlers for an event
   * @private
   */
  setupEventEmitter() {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);

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

  onPlayerSpawn() {
    let chest = this.spawnChest();

    this.server.io.emit('spawnChests', [
      {
        x: chest._x,
        y: chest._y,
        state: chest.state,
        playerRequired: chest.playerRequired,
      },
    ]);

    logger.data(`a chest spawned at (${chest._x},${chest._y}).`);
  }

  /**
   * @private
   */
  initializeChests() {
    this.chestObjects = [];

    for (let i = 0; i < 5; ++i) {
      let chest = this.spawnChest();

      logger.debug(`a chest spawned at (${chest._x},${chest._y}).`);
    }

    this.objectContainer.debugPrint();
  }

  /**
   * Spawns trees around the world based on a given tilemap.
   * Will spawn trees on grass tiles only.
   */
  initializeTrees() {
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let tileType = this.tilemap.getTileAt(x, y);
        if (tileType === Tiles.FOREST) { // forest
          if (Math.random() < 0.8) {
            // Set the object type as a tree
            let tree = new Tree(this, x, y);
            count++;
            this.objectContainer.add(tree);
          }
        } else if (tileType === Tiles.GRASS) {
          if (Math.random() < 0.025) {
            let tree = new Tree(this, x, y);
            count++;
            this.objectContainer.add(tree);
          }
        }
      }
    }

    this.maxTreeNumber = count;
  }

  /**
   * @return {Chest}
   */
  spawnChest() {
    let newX;
    let newY;

    do {
      newX = Math.floor(Math.random() * this.width);
      newY = Math.floor(Math.random() * this.height);
    } while (!this.isPassable(newX, newY, 2));

    let chest = new Chest(this, newX, newY);
    this.chestObjects.push(chest);
    this.objectContainer.add(chest);

    return chest;
  }

  /**
   * @param x {Number}
   * @param y {Number}
   */
  spawnTree(x, y) {
    let tree = new Tree(this, x, y);

    this.objectContainer.add(tree);

    this.outgoingBuffer.push({
      x: x,
      y: y,
      durability: tree.durability,
    });
  }

  /**
   * @param x
   * @param y
   * @return {Array.<Player>}
   */
  getPlayersAt(x, y) {
    return this.players.filter((player) => {
      return player.pos(x, y);
    });
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
      return false;
    }

    logger.debug(`Tile at (${x}, ${y}) is changed to ${tileId}.`);

    if (this.tilemap.getTileAt(x, y) !== tileId) {
      this.tilemap.setTile(x, y, tileId);

      this.server.io.emit('worldUpdate', {
        tiles: [[x, y, tileId]],
      });

      return true;
    }

    return false;
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
  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  /**
   * @param object {GameObject}
   */
  removeObject(object) {
    this.objectContainer.remove(object);

    logger.data(`object removed, now has ${
      this.objectContainer.tree.size
    } objects. `);

    this.server.io.emit('objectRemoval', {
      x: object._x,
      y: object._y,
    });
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
    this.objectContainer.update(dt);

    // update all players.
    this.players.forEach((character) => {
      character.update();
    });

    // update weather
    this.weatherCount += dt;
    if (this.weatherCount >= this.weatherDuration) {
      this.weatherCount = 0;

      this.lastWeather = this.currentWeather;
      this.currentWeather = util.pick([
        World.WEATHER.DRY,
        World.WEATHER.RAIN,
        World.WEATHER.BLIZZARD,
        World.WEATHER.SANDSTORM,
      ]);

      this.emit('weatherChange', this.currentWeather);

      // TODO: Refactor
      this.server.io.emit('weatherChange', this.currentWeather);
      this.onWeatherChange();

      logger.data(`World Weather has changed from ${
        this.lastWeather
        } to ${
        this.currentWeather
      }.`);
    }

    // emit buffer
    if (this.outgoingBuffer.length !== 0) {
      this.server.io.emit('objectUpdate', this.outgoingBuffer);
      this.outgoingBuffer.length = 0;
    }
  }

  /**
   * O(n^2 * 2 log n) algorithm.
   * TODO: Make it efficient.
   */
  spawnRandomTree() {
    let count = 0;
    const grassChance = this.treeGenChance / 1000;
    const forestChance = this.treeGenChance / 333;

    this.tilemap.foreach((x, y, type)=> {
      const rnd = Math.random();
      if (type === Tiles.GRASS) {
        if (rnd <= grassChance && !this.objectContainer.colliding(x, y) &&
          this.getPlayersAt(x, y).length === 0) {
            this.spawnTree(x, y);
            count++;
        }
      } else if (type === Tiles.FOREST) {
        if (rnd <= forestChance && !this.objectContainer.colliding(x, y) &&
          this.getPlayersAt(x, y).length === 0) {
          this.spawnTree(x, y);
          count++;
        }
      }
    });

    logger.data(`New Trees has spawned ${count}, there is a total of ${
      this.objectContainer.tree.size
      } trees on the world. The chance was ${
      grassChance
      } and ${forestChance}.`);
  }

  onWeatherChange() {
    if (this.lastWeather === World.WEATHER.RAIN &&
        this.currentWeather !== World.WEATHER.RAIN) {
      // 50 is the number of chests of, object container count them as well.
      // TODO: Fix this, forgive my messy code.
      if (this.objectContainer.tree.size < this.maxTreeNumber + 50) {
        this.spawnRandomTree();
      }
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
