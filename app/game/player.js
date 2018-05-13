'use strict';

const Character = require('./character.js');

class Player extends Character {
  constructor(x, y, id) {
    super(x, y);
    this.id = id;
  }
}

module.exports = Player;
