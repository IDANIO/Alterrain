'use strict';

const Character = require('./character.js');

class Player extends Character {
  constructor(world, x, y, id) {
    super(world, x, y);
    this.id = id;
  }
}

module.exports = Player;
