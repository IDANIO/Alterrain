'use strict';

const EventEmitter = require('events');
const World = require('./game/world.js');
const logger = require('./logger.js');

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
    this.world = new World(this);

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
   * Called when the Client first opens up the browser.
   * However the players is no yet joined to the world.
   * @param socket {Socket}
   */
  onPlayerConnected(socket) {
    let onlineCount = this.connectedPlayers.size + 1;
    logger.info(`[${onlineCount}] A Client connected`);

    // get next available id
    let playerId = ++this.lastPlayerID;

    // save player
    this.connectedPlayers.set(socket.id, {
      socket: socket,
      state: 'new',
      playerId: playerId,
    });

    // create a new Event (indicating connection)
    let playerEvent = {
      id: socket.id,
      playerId: playerId,
      joinTime: (new Date()).getTime(),
      disconnectTime: 0,
    };

    logger.data(`[${playerEvent.id}] Has joined the world
      playerId        ${playerEvent.playerId}
      joinTime        ${playerEvent.joinTime}
      disconnectTime  ${playerEvent.disconnectTime}`);


    this.onPlayerJoinWorld(socket, playerEvent);

    socket.on('disconnect', () => {
      playerEvent.disconnectTime = (new Date()).getTime();
      socket.broadcast.emit('playerEvent', playerEvent);

      this.onPlayerDisconnected(socket);

      logger.data(`[${playerEvent.id}][playerEvent] disconnect
      playerId        ${playerEvent.playerId}
      joinTime        ${playerEvent.joinTime}
      disconnectTime  ${playerEvent.disconnectTime}`);
    });
  }

  /**
   * handle player when join the world
   * @param socket {Socket}
   * @param playerEvent {Object}
   */
  onPlayerJoinWorld(socket, playerEvent) {
    // This send the data of all players to the new-joined client.
    playerEvent.x = 64;
    playerEvent.y = 64;

    this.world.addObject(playerEvent.playerId);

    let objects = [];
    this.world.objects.forEach((value) => {
      objects.push(value);
    });

    socket.emit('initWorld', {
      players: objects,
      tiles: this.world.getTileMap(),
      id: playerEvent.playerId
    });

    // This send out the new-joined client's data to all other clients
    socket.broadcast.emit('playerEvent', playerEvent);

    /**
     * Receive Input from Client
     * TODO: Rename messages name to something else
     */
    socket.on('moveplayer', (data) => {
      this.onReceivedInput(data, socket, playerEvent.playerId);
    });
  }

  /**
   * handle player dis-connection
   * @param socket {Socket}
   */
  onPlayerDisconnected(socket) {
    // Remove from Game World
    let player = this.connectedPlayers.get(socket.id);
    if (player) {
      this.world.removeObject(player.playerId);
    } else {
      logger.error('should not happen');
    }

    // Remove from server
    this.connectedPlayers.delete(socket.id);

    let onlineCount = this.connectedPlayers.size;
    logger.info(`[${onlineCount}] A Client disconnected`);
  }

  /**
   *
   * @param data {{dx,dy, tile}} Temp
   * @param socket {Socket}
   * @param playerId {Number}
   */
  onReceivedInput(data, socket, playerId) {
    let player = this.world.objects.get(playerId);

    if (data.tile) {
      this.world.changeTile(player.x, player.y);
      return;
    }

    if (player) {
      player.x += data.dx || 0;
      player.y += data.dy || 0;
    }

    this.io.emit('playerMovement', {
      id: playerId,
      x: player.x,
      y: player.y,
    });
  }

  getPlayerCount() {
    return this.connectedPlayers.size;
  }
}

module.exports = Server;
