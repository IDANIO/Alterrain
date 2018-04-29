let express = require('express');
let app = express();
let path = require('path');

let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
  console.log('A client connected..');
  socket.on('disconnect', () => {
    console.log('A client Disconnected..')
  })
});
