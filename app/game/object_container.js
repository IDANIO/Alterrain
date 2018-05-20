'use strict';

const Quadtree = require('quadtree-lib');
const logger = require('../logger.js');

/**
 * @link https://github.com/elbywan/quadtree-lib
 */
class ObjectContainer {
  constructor(world) {
    this.tree = new Quadtree({
      width: world.width,
      height: world.height,
      maxElements: 5,
    });
  }

  /**
   * @param object {GameObject}
   * @return {GameObject} for chaining.
   */
  add(object) {
    this.tree.push({
      x: object._x,
      y: object._y,
      width: 1,
      height: 1,
      object: object,
    });

    return object;
  }

  /**
   * @param type {String}
   * @return {Array.<GameObject>}
   */
  getObjects(type) {
    return this.tree.find(((elt) => {
      return elt.object.type === type;
    })).map((elt) => {
      return elt.object;
    });
  }

  /**
   * @param x
   * @param y
   * @return {GameObject}
   */
  colliding(x, y) {
    let colliding = this.tree.colliding({
      x: x,
      y: y,
      width: 1,
      height: 1,
    });

    let treeObj = colliding[0];
    if (treeObj) {
      return treeObj.object;
    }
  }

  remove() {
  }

  debugPrint() {
    logger.debug(this.tree.pretty());
  }
}

module.exports = ObjectContainer;
