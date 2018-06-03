'use strict';

/**
 * @param map {Tilemap}
 * @return {string}
 */
module.exports = (map) => {
  let str = `${map.width} ${map.height} `;

  for (let i = 0; i < map.width; i++) {
    for (let j = 0; j < map.height; j++) {
      str += `${map.data[i][j]} `;
    }
  }

  return str;
};
