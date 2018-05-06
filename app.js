'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');
const chalk = require('chalk');
const logger = require('morgan');
const errorHandler = require('errorhandler');

/**
 * import Server Game
 */
const Game = require('./app/server.js');

/**
 * Load environment variables from .env file.
 */
dotenv.load({path: '.env'});

/**
 * Create Express server.
 */
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

/**
 * Express configuration.
 */
app.use(compression());
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/**
 * Socket
 */
server.listen(port, () => {
  console.log(`
  ___ ____    _    _   _ ___ ___  
 |_ _|  _ \\  / \\  | \\ | |_ _/ _ \\ 
  | || | | |/ _ \\ |  \\| || | | | |
  | || |_| / ___ \\| |\\  || | |_| |
 |___|____/_/   \\_\\_| \\_|___\\___/ 
                                  
  Port: ${chalk.blue(port)}
  http://localhost:${port}
  `);
});

/**
 * Basic Routing.
 */
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

/**
 * Constructing a Server Game instance, and start server game clock.
 * @type {Server}
 */
const game = new Game(io);
game.start();

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}

module.exports = app;
