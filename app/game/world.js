/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
class World {
  constructor() {
    /**
     * @type {Map<Number, Object>}
     */
    this.objects = new Map();
    this.stepCount = 0;
  }

  /**
   * @param playerId
   */
  addObject(playerId) {
    this.objects.set(playerId, {
      id: playerId,
      x: 50,
      y: 50,
    });
  }

  getObjects() {
    return this.objects.values();
  }

  step(dt) {

  }
}

module.exports = World;
