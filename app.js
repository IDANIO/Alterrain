'use strict';
const path = require('path');
const compression = require('compression');

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

const logger = require('./app/logger.js');

server.listen(port, () => {
  logger.info(`Server listening at port ${port}`);
  logger.info(`http://localhost:${port}`);
});

app.use(compression());

// Routing
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
  logger.info('A client connected..');

  socket.on('disconnect', () => {
    logger.info('A client Disconnected..');
  });
});
