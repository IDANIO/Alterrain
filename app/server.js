'use strict';

const EventEmitter = require('events');
const World = require('./game/world.js');

/**
 * Server is the main server-side singleton code.
 * This class should not be used to contain the actual game logic.
 * Only logging gameplay statistics and registering user activity and user data.
 */
class Server {
  constructor(io) {
    /**
     * @type {Map<String, Object>} HashTable that contains the currently
     * connected players.
     */
    this.connectedPlayers = new Map();

    this.intervalFrameRate = 60;
    this.lastPlayerID = 0;

    /**
     * @type {World} The actual game world
     */
    this.world = null;

    this.setupEventEmitter();
    this.setupSocketIO(io);
  }

  /**
   * Register handlers for an event
   * @private
   */
  setupEventEmitter() {
    let emitter = new EventEmitter();

    this.on = emitter.on;
    this.once = emitter.once;
    this.removeListener = emitter.removeListener;

    this.emit = emitter.emit;
  }

  /**
   * @param io {Socket}
   */
  setupSocketIO(io) {
    this.io = io;
    io.on('connection', this.onPlayerConnected.bind(this));
  }

  /**
   * @param worldSettings {Object=}
   */
  initWorld(worldSettings) {
    this.world = new World();

    /**
     * The worldSettings defines the game world constants, such
     * as width, height, depth, etc. such that all other classes
     * can reference these values.
     * @member {Object} worldSettings
     * @memberof Server
     */
    this.worldSettings = Object.assign({}, worldSettings);
  }

  /**
   * Start game logic and the clock
   */
  start() {
    this.initWorld();

    const intervalDelta = Math.floor(1000 / this.intervalFrameRate);
    this.intervalGameTick = setInterval(this.step.bind(this), intervalDelta);
  }

  /**
   * Single game step.
   *
   * @param {Number=} dt - elapsed time since last step was called.
   */
  step(dt) {
    this.serverTime = (new Date().getTime());

    // let step = ++this.world.stepCount;

    // this.emit('preStep', {step, dt});

    // Main Game Update Goes Here
    this.world.step(dt);

    // for (const player of this.connectedPlayers) {
    //   if (player.state === 'new') {
    //     player.state = 'synced';
    //   }
    //   player.socket.emit('worldUpdate', {});
    // }

    // this.emit('postStep', {step});
  }

  /**
   * @param socket {Socket}
   */
  onPlayerConnected(socket) {
    let onlineCount = this.connectedPlayers.size + 1;
    console.log(`[${onlineCount}] A Client connected`, socket.id);

    // save player
    this.connectedPlayers.set(socket.id, {
      socket: socket,
      state: 'new',
    });

    let playerId = socket.playerId = ++this.lastPlayerID;
    socket.joinTime = (new Date()).getTime();

    let playerEvent = {
      id: socket.id,
      playerId,
      joinTime: socket.joinTime,
      disconnectTime: 0,
    };

    socket.on('newplayer', () => {
        // TODO: Remove this
        socket.player = {
          id: playerId,
          x: 50,
          y: 50,
        };

        console.log(`[playerEvent] connected
        playerId        ${playerEvent.playerId}
        joinTime        ${playerEvent.joinTime}
        disconnectTime  ${playerEvent.disconnectTime}`);

        // This send the data of all player to the new-joined client.
        let players = [];
        this.connectedPlayers.forEach((value, key) => {
          let player = value.socket.player;
          if (player && value.state !== 'new') {
            players.push(player);
          }
        });

        // TODO: Rename
        socket.emit('allplayers', players);
        // socket.emit('playerJoined', playerEvent);

        // This send out the new-joined client data to all other clients
        // TODO: Rename
        socket.broadcast.emit(`newplayer`, socket.player);

        // this.resetIdleTimeout(socket);

        /**
         * Receive Input from Client
         * TODO: Rename messages name to something else
         */
        socket.on('moveplayer', (data) => {
          this.onReceivedInput(data, socket);

          // console.log(`[onReceivedInput]
          // id:${socket.player.id}
          // x: ${socket.player.x}
          // y: ${socket.player.y}
          // `);
        });
      }
    );
    socket.on('disconnect', () => {
      playerEvent.disconnectTime = (new Date()).getTime();
      this.onPlayerDisconnected(socket.id, playerId);
      // this.gameEngine.emit('server__playerDisconnected', playerEvent);
      // this.gameEngine.emit('playerDisconnected', playerEvent);

      console.log(`[playerEvent] disconnect
      playerId        ${playerEvent.playerId}
      joinTime        ${playerEvent.joinTime}
      disconnectTime  ${playerEvent.disconnectTime}`);
    });
  }

  // /**
  //  * handle player timeout
  //  * @param socket {Socket}
  //  */
  // onPlayerTimeout(socket) {
  //   // console.log(`Client timed out after ${this.options.timeoutInterval}
  //   // seconds`, socket.id);
  //   console.log(`Client timed out after seconds`, socket.id);
  //   socket.disconnect();
  // }

  /**
   * handle player dis-connection
   * @param socketId {String}
   * @param playerId {Number}
   */
  onPlayerDisconnected(socketId, playerId) {
    this.connectedPlayers.delete(socketId);

    let onlineCount = this.connectedPlayers.size;
    console.log(`[${onlineCount}] A Client disconnected`, socketId);
  }

  // /**
  //  * handle player timeout
  //  * @param socket {Socket}
  //  */
  // resetIdleTimeout(socket) {
  //   // if (socket.idleTimeout) {
  //   //   clearTimeout(socket.idleTimeout);
  //   // }
  //   // socket.idleTimeout = setTimeout(() => {
  //   //   this.onPlayerTimeout(socket);
  //   // }, 60 * 1000);
  // }

  /**
   *
   * @param data {{x,y}} Temp
   * @param socket {Socket}
   */
  onReceivedInput(data, socket) {
    // this.resetIdleTimeout(socket);
    socket.player.x += data.dx;
    socket.player.y += data.dy;

    this.io.emit('moveplayer', socket.player);
  }
}

module.exports = Server;
