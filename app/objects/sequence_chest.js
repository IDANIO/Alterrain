'use strict';

const Chest = require('../objects/chest.js');

class SequenceChest extends Chest {
  constructor(world, x = 0, y = 0) {
    super(world, x, y);

    this.playerRequired = 2;
  }
}

module.exports = SequenceChest;
