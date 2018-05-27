'use strict';

const util = require('../util.js');
const GameObject = require('../objects/game_object.js');
const {Tiles} = require('../../shared/constant.js');

class Tree extends GameObject {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);
    this.type = 'tree';

    this.durability = util.integerInRange(1, 4);

    // TODO: temp, later change this to WOOD
    this.loot = Tiles.GRASS;
  }

  onInteraction(player) {
    if (this.durability >= 0) {
      this.durability--;
    }
    if (this.durability === 0) {
      player.gainItem(this.loot, util.integerInRange(1, 2));
    }
    this.world.server.io.emit('treeCut', {
      x: this._x,
      y: this._y,
      durability: this.durability,
    });
  }
}

module.exports = Tree;
