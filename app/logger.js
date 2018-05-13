'use strict';

const {createLogger, format, transports} = require('winston');
const {combine, colorize, simple} = format;

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
    data: 4,
    debug: 5,

  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    data: 'grey',
    debug: 'blue',
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
    new transports.Console({
      level: (process.env.NODE_ENV === 'development') ? 'debug' : 'data',
    }),
    new transports.File({
      filename: 'debugger.log',
      maxsize: 5242880,
      level: (process.env.NODE_ENV === 'development') ? 'debug' : 'info',
    }),
  ],
});

module.exports = logger;
