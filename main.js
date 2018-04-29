const path = require('path');
const express = require('express');
const compression = require('compression');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(compression());

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A client connected..');
  socket.on('disconnect', () => {
    console.log('A client Disconnected..');
  });
});
