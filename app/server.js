// const Tiles = require('./game/tiles');

class Server {
  constructor(io) {
    this.lastPlayerID = 0;
    this.setupSocketIO(io);
  }

  setupSocketIO(io) {
    this.io = io;
    io.on('connection', (socket) => {
      socket.on('newplayer', () => {
        socket.player = {
          id: this.lastPlayerID++,
          x: randomInt(100, 400),
          y: randomInt(100, 400),
        };

        socket.emit('allplayers', this.getAllPlayers());

        socket.broadcast.emit('newplayer', socket.player);

        socket.on('moveplayer', (data) => {
          socket.player.x += data.dx;
          socket.player.y += data.dy;
          io.emit('moveplayer', socket.player);
        });

        socket.on('disconnect', () => {
          io.emit('remove', socket.player.id);
        });
      });
    });
  }

  /**
   * Start game logic and the clock
   */
  startGameClock() {
    this.intervalGameTick = setInterval(() => {
    });
  }

  /**
   * tick based on the frame interval
   * in this game it is 1000/60
   * handle all the game module's update
   * @private
   */
  tick() {

  }

  getAllPlayers() {
    let players = [];
    Object.keys(this.io.sockets.connected).forEach((socketID) => {
      let player = this.io.sockets.connected[socketID].player;
      if (player) {
        players.push(player);
      }
    });
    return players;
  }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports = Server;
