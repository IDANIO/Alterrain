'use strict';

/**
 * @param container {Array | Map} Serializable Container
 * @return {string}
 */
module.exports = (container) => {
  let str = '';

  container.forEach((elt) => {
    str += `${elt.serialize()}|`;
  });

  return str;
};
