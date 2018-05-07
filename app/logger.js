'use strict';

const {createLogger, format, transports} = require('winston');
const {combine, colorize, simple} = format;

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
  },
};

/**
 * @instance
 * @type {{log, info, warn, error, debug, data}}
 */
const logger = createLogger({
  levels: config.levels,
  format: combine(
    colorize({all: true}),
    simple()
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
