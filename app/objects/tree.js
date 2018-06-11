'use strict';

const util = require('../util.js');
const logger = require('../logger.js');

const GameObject = require('../objects/game_object.js');
const Chest = require('./chest.js');

const {Tiles} = require('../../shared/constant.js');

class Tree extends GameObject {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);
    this.type = 'tree';

    this.durability = util.integerInRange(3, 8);

    this.tresureChestChance = 3; // 3% chance
    this.removeCount = 1 * 60; // 30 * 60;

    this.loot = Tiles.BRIDGE;
  }

  onUpdate(dt) {
    if (this.durability <= 0) {
      this.removeCount--;
    }
    if (this.removeCount <= 0) {
      this.world.emit('objectRemoval', this);

      if (util.integerInRange(0, 100) <= this.tresureChestChance) {
        this.revealHiddenChest();
      }
    }
  }

  onInteraction(player) {
    if (this.durability >= 0) {
      this.durability--;
    }
    if (this.durability === 0) {
      player.gainItem(this.loot, util.integerInRange(1, 3));
    }
    this.world.server.io.emit('treeCut', {
      x: this._x,
      y: this._y,
      durability: this.durability,
    });
  }

  /**
   * @private
   */
  revealHiddenChest() {
      let chest = new Chest(this.world, this._x, this._y);
      this.world.chestObjects.push(chest);
      this.world.objectContainer.add(chest);

      this.world.server.io.emit('spawnChests', [
        {
          x: chest._x,
          y: chest._y,
          state: chest.state,
          playerRequired: chest.playerRequired,
        },
      ]);

      logger.data(`a chest spawned at (${chest._x},${chest._y}).`);
  }

  serialize() {
    return `${super.serialize()} ${this.durability}`;
  }
}

module.exports = Tree;
