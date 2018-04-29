const path = require('path');

const express = require('express');
const app = express();

const compression = require('compression');

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
  console.log(`http://localhost:${port}`);
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
