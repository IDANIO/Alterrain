// const Tiles = require('./game/tiles');
const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;

class Server {
  constructor(io) {
    this.lastPlayerID = 0;
    this.setupSocketIO(io);
    //The game world represented in a 2D array
    //0 = grass
    //1 = sand
    this.tileMap = [];
    //The heightmap, used to procedurally generate
    //the tilemap
    this.heightmap = [];
    for(let i = 0; i < MAP_HEIGHT; i++){
      this.tileMap[i] = [];
      this.heightmap[i] = [];
    }
    
    generateNoise(this.heightmap, MAP_WIDTH, MAP_HEIGHT);
    generateTileMap(this.tileMap, this.heightmap);
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
        
        //Send the tilemap data to the new player
        socket.emit("tilemap", this.tileMap);

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

/**
 * Returns the type of terrain that corresponds to the
 * given parameters
 * @param elevation The 2D array that represents the elevation
 * @param moisture The 2D array that represents the moisture
 * @returns {number} an integer that corresponds to a specific tile type
 */
function getBiomeType(elevation, moisture){
    //TODO properly check the terrain type
    if(elevation < 0.5){
        return 0;
    }
    else{
        return 1;
    }
}

/**
 * Returns the type of terrain that corresponds to the
 * given parameters
 * @param arr The 2D array to fill
 * @param width The width of the 2D array
 * @param height The height of the 2D array
 */
function generateNoise(arr, width, height){
    for(let i = 0; i < width; i++){
        for(let j = 0; j < height; j++){
            //TODO use an actual noise function
            arr[i][j] = Math.random() * 2 - 1;
        }
    }
}

/**
 * Creates the tilemap of the game world based on different
 * layers of noise
 * @param tilemap The 2D array to generate tiles in
 * @param heightmap A 2D array of noise representing elevation
 */
function generateTileMap(tilemap, heightmap){
    //TODO properly generate the tilemap based on the heightmap
    //layer and other layers
    for(let i = 0; i < tilemap.length; i++){
        for(let j = 0; j < tilemap.length; j++){
            let e = heightmap[i][j];
            let tileType = getBiomeType(e, 0);
            tilemap[i][j] = tileType;
        }
    }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports = Server;
