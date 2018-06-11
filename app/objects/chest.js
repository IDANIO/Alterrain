'use strict';

const logger = require('../logger.js');
const util = require('../util.js');
const GameObject = require('../objects/game_object');
const {Tiles} = require('../../shared/constant.js');

class Chest extends GameObject {
  constructor(world, x, y, canRespawn = false) {
    super(world, x, y);
    this.type = 'chest';

    this.state = Chest.STATE_LOCKED;

    this.loots = [
      Tiles.GRASS, Tiles.STONE, Tiles.SAND,
      Tiles.FOREST, Tiles.SNOW, Tiles.DESERT,
      Tiles.ICE, Tiles.COBBLESTONE
    ];

    this.playerRequired = 1;
    this.playerHistory = [];
    this.canRespawn = canRespawn;
    this.success = null;

    this.count = 10 * 1000;
  }

  onUpdate(dt) {
    if (this.state === Chest.STATE_LOOTED) {
      this.count -= dt;

      if (this.count <= 0) {
        this.world.emit('objectRemoval', this);

        if (this.canRespawn) {
          let chest = this.world.spawnChest(true, true);

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
      }
    }
  }

  /**
   * @return {boolean}
   */
  canOpen() {
    return this.playerRequired <= 0;
  }

  /**
   * @param player
   */
  awardPlayer(player) {
    let item = util.pick(this.loots);
    player.gainItem(item, util.integerInRange(20, 48));
  }

  /**
   * @param player
   * @return {boolean}
   */
  isNewPlayer(player) {
    return !this.playerHistory.includes(player.id);
  }

  /**
   * @param player {Player} the player who interacts with this object.
   */
  onInteraction(player) {
    // logger.debug(`Player ${player.id} is interacting Box \
    //  (state ${this.state})`);

    switch (this.state) {
      case Chest.STATE_LOCKED:
        this.onClosed(player);
        break;
      case Chest.STATE_UNLOCK:
        this.onUnlock(player);
        break;
      case Chest.STATE_OPENED:
        this.onOpened(player);
        break;
      case Chest.STATE_LOOTED:
        this.onLooted(player);
        break;
    }

    // TODO: Refactor
    console.log(this.world);
    this.world.server.io.emit('chestUpdate', {
      x: this._x,
      y: this._y,
      state: this.state,
      playerRequired: this.playerRequired,
    });
  }

  /**
   * @param player {Player}
   */
  onClosed(player) {
    this.state = Chest.STATE_UNLOCK;

    this.onUnlock(player);
  }

  /**
   * @param player {Player}
   */
  onUnlock(player) {
    if (this.isNewPlayer(player)) {
      this.playerRequired--;
      this.playerHistory.push(player.id);
    }

    if (this.canOpen()) {
      this.state = Chest.STATE_OPENED;
    }
  }

  /**
   * @param player {Player}
   */
  onOpened(player) {
    this.awardPlayer(player);

    this.state = Chest.STATE_LOOTED;
  }

  /**
   * @param player {Player}
   */
  onLooted(player) {
  }

  serialize() {
    return `${super.serialize()} ${this.state} ${this.playerRequired}`;
  }
}

Chest.STATE_LOCKED = 0;
Chest.STATE_UNLOCK = 1;
Chest.STATE_OPENED = 2;
Chest.STATE_LOOTED = 3;

module.exports = Chest;
