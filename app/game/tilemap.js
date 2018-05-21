'use strict';

const noise = require('../libs/perlin.js');

const {TileData} = require('../../shared/constant.js');

class Tilemap {
  constructor(world) {
    /**
     * @type {World} Reference to the World instance.
     */
    this.world = world;

    /**
     * 0 = grass
     * 1 = sand
     * 2 = stone - temp
     * 3 = water - can not pass
     * @type {Array.<Array.<Number>>} The game world represented in a 2D array.
     */
    this.data = [];

    /**
     * @type {Array.<Array.<Number>>} The heightmap, used to procedurally
     * generate the tilemap.
     */
    this.heightmap = [];

    /**
     * @type {Array.<Array.<Number>>} The moisture, used to procedurally
     * generate the tilemap.
     */
    this.moisture = [];

    for (let i = 0; i < this.world.height; i++) {
      this.data[i] = [];
      this.heightmap[i] = [];
      this.moisture[i] = [];
    }

    this.generateNoise(this.heightmap, this.world.width, this.world.height);
    this.generateNoise(this.moisture, this.world.width, this.world.height);
    this.generateTileMap(this.data, this.heightmap, this.moisture);
  }

  /**
   * @return {Array<Array<Number>>}
   */
  getData() {
    return this.data;
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @return {Number}
   */
  getTileAt(x, y) {
    return this.data[x][y];
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @param bit {Number} Binary mask for direction.
   * @return {boolean}
   */
  checkPassage(x, y, bit) {
    let tile = this.data[x][y];

    return TileData[tile] === 0;
  }

  /**
   * @param x {Number}
   * @param y {Number}
   * @param tileId {Number}
   */
  setTile(x, y, tileId) {
    this.data[x][y] = tileId;
  }

  /** OLD - uses elevation only and returns only 3 biomes
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param e The 2D array that represents the elevation
   * @param m The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
  getBiomeType(e, m) {
    if (e < 0.4) {
      return 3; // water
    }
    if (e < 0.55) {
      return 1; // sand
    }
    if (e < 0.7) {
      return 0; // grass
    }
    return 2; // stone
  }

  /** USE THIS FUNCTION WHEN WE HAVE MORE BIOMES
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param e The 2D array that represents the elevation
   * @param m The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
  getBiomeTypeBetter(e, m) { // 0 = grass, 1 = sand, 2 = stone, 3 = water
    if (e < 0.1) {
      // ocean
      return 3;
    }
    if (e < 0.12) {
      // beach
      return 1;
    }
    if (e > 0.8) {
      if (m < 0.1) {
        // scorched
      }
      if (m < 0.2) {
        // bare
      }
      if (m < 0.5) {
        // tundra
        return 2;
      }
      // snow
      return 2;
    }
    if (e > 0.6) {
      if (m < 0.33) {
        // temperate desert
        return 1;
      }
      if (m < 0.66) {
        // shrubland
        return 0;
      }
      // taiga
      return 2;
    }
    if (e > 0.3) {
      if (m < 0.16) {
        // temperate desert
        return 1;
      }
      if (m < 0.5) {
        // grassland
        return 0;
      }
      if (m < 0.83) {
        // temperate deciduous forest
      }
      // temperate rain forest
    }
    if (m < 0.16) {
      // subtropical desert
      return 1;
    }
    if (m < 0.33) {
      // grassland
      return 0;
    }
    if (m < 0.66) {
      // tropical seasonal rainforest
    }
    // tropical rainforest
  }

  /**
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param arr The 2D array to fill
   * @param width The width of the 2D array
   * @param height The height of the 2D array
   */
  generateNoise(arr, width, height) {
    // let noise = new Noise();
    noise.seed(Math.random());
    // let freq = 1.2; //Frequency, should be a constant
    let freq = 2.2;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let nx = i / this.world.width - 0.5;
        let ny = j / this.world.height - 0.5;
        arr[i][j] = noise.perlin2(freq * nx, freq * ny)
          + freq / 2 * noise.perlin2(freq * 2 * nx, freq * 2 * ny)
          + freq / 4 * noise.perlin2(freq * 4 + nx, freq * 4 + ny);
        arr[i][j] = (arr[i][j] + 1) / 2;
      }
    }
  }

  /**
   * Creates the tilemap of the game world based on different
   * layers of noise
   * @param tilemap The 2D array to generate tiles in
   * @param heightmap A 2D array of noise representing elevation
   * @param moisture
   */
  generateTileMap(tilemap, heightmap, moisture) {
    // TODO properly generate the tilemap based on the heightmap
    // layer and other layers
    for (let i = 0; i < tilemap.length; i++) {
      for (let j = 0; j < tilemap.length; j++) {
        let e = heightmap[i][j];
        let m = moisture[i][j];
        let tileType = this.getBiomeType(e, m);
        tilemap[i][j] = tileType;
      }
    }
  }
}

module.exports = Tilemap;
