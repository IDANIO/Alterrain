'use strict';

const GameObject = require('../objects/game_object.js');

const Weathers = require('../game/world.js').WEATHER;

class TileObject extends GameObject {
  constructor(world, x, y, tileId) {
    super(world, x, y);

    this.tileId = tileId;

    this.expandStrategy = null;

    // setup weather event listener
    this.world.on('weatherChange', (newWeather) => {
      switch (newWeather) {
        case Weathers.DRY:
          this.onDry();
          break;
        case Weathers.RAIN:
          this.onRain();
          break;
        case Weathers.BLIZZARD:
          this.onBlizzard();
          break;
        case Weathers.SANDSTORM:
          this.onSandstorm();
          break;
      }
    });
  }

  expand() { }

  /**
   * @abstract
   */
  onDry() { }

  /**
   * @abstract
   */
  onRain() { console.log('good') }

  /**
   * @abstract
   */
  onBlizzard() { }

  /**
   * @abstract
   */
  onSandstorm() { }
}

module.exports = TileObject;
