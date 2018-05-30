'use strict';

const util = require('../util.js');
const GameObject = require('../objects/game_object.js');
const {Tiles} = require('../../shared/constant.js');

class Tree extends GameObject {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);
    this.type = 'tree';

    this.durability = util.integerInRange(3, 8);

    this.removeCount = 1 * 60; // 30 * 60;

    this.loot = Tiles.BRIDGE;
  }

  onUpdate(dt) {
    if (this.durability <= 0) {
      this.removeCount--;
    }
    if (this.removeCount <= 0) {
      this.world.emit('objectRemoval', this);
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
}

module.exports = Tree;
