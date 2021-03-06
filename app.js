'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const helmet = require('helmet');
const nocache = require('nocache');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');
const errorHandler = require('errorhandler');

/**
 * import Server Game
 */
const Game = require('./app/server.js');
const logger = require('./app/logger.js');

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
app.use(helmet());
app.use(compression());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (process.env.NODE_ENV === 'development') {
  app.use(nocache()); // only use in development
}

/**
 * Socket
 */
server.listen(port, () => {
  logger.log('info', `
    ___ ____    _    _   _ ___ ___  
   |_ _|  _ \\  / \\  | \\ | |_ _/ _ \\ 
    | || | | |/ _ \\ |  \\| || | | | |
    | || |_| / ___ \\| |\\  || | |_| |
   |___|____/_/   \\_\\_| \\_|___\\___/ 
                                  
✓ App is running at http://localhost:${port} in ${app.get('env')} mode.
  Command line arguments: ${process.argv.slice(2)}
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
game.setup(process.argv.slice(2));
game.start();

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}

module.exports = app;
