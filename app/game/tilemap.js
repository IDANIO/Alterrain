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

    this.frequency = 4.3;
    this.waterMax = 0.3;
    this.sandMax = 0.45;
    this.grassMax = 0.65;
    this.stoneMax = 1;

    this.iceRatio = 0.1;
    this.beachRatio = 0.5;
    this.forestRatio = 0.66;
    this.desertRatio = 0.33;
    this.snowRatio = 0.5;

    this.generateTerrain();
  }

  generateTerrain() {
    this.generateNoise(this.heightmap, this.world.width,
      this.world.height, this.frequency);

    this.islandMask1 = this.generateIslandMask(this.world.width,
      this.world.height, -32, -32, -31, -31);
    this.islandMask2 = this.generateIslandMask(this.world.width,
      this.world.height, 44, 44, 45, 45);
    this.islandMask3 = this.generateIslandMask(this.world.width,
      this.world.height, 102, 102, 103, 103);

    this.blendMasks(this.heightmap,
      [this.islandMask1, this.islandMask2, this.islandMask3]);

    this.generateNoise(this.moisture, this.world.width,
      this.world.height, this.frequency);

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
    if (e < this.waterMax) {
      return 3; // water
    }
    if (e < this.sandMax) {
      return 1; // sand
    }
    if (e < this.grassMax) {
      return 0; // grass
    }
    if (e <= this.stoneMax) {
      return 2;
    }
  }

  /** USE THIS FUNCTION WHEN WE HAVE MORE BIOMES
   * Returns the type of terrain that corresponds to the
   * given parameters
   * @param e The 2D array that represents the elevation
   * @param m The 2D array that represents the moisture
   * @returns {number} an integer that corresponds to a specific tile type
   */
   getBiomeTypeBetter(e, m) { // 0 = grass, 1 = sand, 2 = stone, 3 = water
    if (e < this.waterMax) {
      if(m < this.iceRatio){
        return 8; // ice
      }
      return 3; // water
    }
    if (e < this.sandMax) {
      if (m < this.beachRatio) {
        return 1; // sand
      }
      return 0; // grass
    }
    if (e < this.grassMax) {
      if (m < this.desertRatio) {
        return 7; // desert
      }
      if (m < this.forestRatio) {
        return 5; // forest
      }
      return 0; // grass
    }
    // if (e <= this.stoneMax) {
    if (m < this.snowRatio) {
      return 6; // snow
    }
    return 2; // stone
    // }
  }

  /**
   * Returns a 2D array of a circular gradient
   * @param width The width of the 2D array
   * @param height The height of the 2D array
   * @param x1 The min range for the x position of the gradient
   * @param y1 The min range for the y position of the gradient
   * @param x2 The max range for the x position of the gradient
   * @param y2 The max range for the y position of the gradient
   */
  generateIslandMask(width, height, x1, y1, x2, y2) {
    let maskArray = [];
    for (let i = 0; i < height; i++) {
      maskArray[i] = [];
    }

    let centerX = x1 + Math.floor((Math.random() * ((x2 - x1) + 1)));
    let centerY = y1 + Math.floor((Math.random() * ((y2 - y1) + 1)));

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let distX = (centerX - i) * (centerX - i);
        let distY = (centerY - j) * (centerY - j);
        let distToCenter = Math.sqrt(distX + distY);
        distToCenter /= width;
        maskArray[i][j] = distToCenter;
      }
    }
    return maskArray;
  }

  blendMasks(arr, masks) {
    let blendMap = [];
    for (let i = 0; i < arr[0].length; i++) {
      blendMap[i] = [];
    }
    let blendMapMax = -10;
    let blendMapMin = 10;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        let blendValue = 1;
        for (let n = 0; n < masks.length; n++) {
          blendValue *= masks[n][i][j];
        }
        if (blendValue > blendMapMax) {
          blendMapMax = blendValue;
        }
        if (blendValue < blendMapMin) {
          blendMapMin = blendValue;
        }
        blendMap[i][j] = blendValue;
      }
    }

    for (let i = 0; i < blendMap.length; i++) {
      for (let j = 0; j < blendMap[i].length; j++) {
        blendMap[i][j] = (blendMap[i][j] - blendMapMin) /
          (blendMapMax - blendMapMin);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        arr[i][j] -= blendMap[i][j];
      }
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
        let tileType = this.getBiomeTypeBetter(e, m);
        tilemap[i][j] = tileType;
      }
    }
  }
}

module.exports = Tilemap;
