'use strict';

const World = require('./game/world.js');
const logger = require('./logger.js');
const {ServerConfig, Commands} = require('../shared/constant.js');

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
    this.playerInputQueues = {};

    this.intervalFrameRate = ServerConfig.STEP_RATE || 60;
    this.maximumPlayer = ServerConfig.MAX_PLAYERS || 50;

    this.lastPlayerID = 0;

    /**
     * @type {World} The actual game world
     */
    this.world = null;

    this.setupSocketIO(io);
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

    let step = ++this.world.stepCount;

    // this.emit('preStep', {step, dt});


    // Main Game Update Goes Here
    this.world.step(dt);


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
    playerEvent.x = 5;
    playerEvent.y = 5;

    this.world.addObject(playerEvent.playerId);

    let objects = [];
    this.world.objects.forEach((player) => {
      objects.push({
        x: player._x,
        y: player._y,
        id: player.id,
      });
    });

    socket.emit('initWorld', {
      players: objects,
      tiles: this.world.getTileMap(),
      id: playerEvent.playerId,
    });

    // This send out the new-joined client's data to all other clients
    socket.broadcast.emit('playerEvent', playerEvent);

    socket.on('inputCommand', (cmd) => {
      this.onReceivedInput(cmd, socket, playerEvent.playerId);
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
   * @param cmd {Object}
   * @param cmd.type {Number} import from 'constant.js' Commands
   * @param cmd.params {Object}
   * @param socket {Socket}
   * @param playerId {Number}
   */
  onReceivedInput(cmd, socket, playerId) {
    let player = this.world.objects.get(playerId);

    // TODO: refactor/decoupling this
    switch (cmd.type) {
      // eslint-disable-next-line no-case-declarations
      case Commands.MOVEMENT:
        let dir = cmd.params;

        // check if can pass?
        player.moveStraight(dir);

        // then
        this.io.emit('playerUpdate', {
          id: playerId,
          x: player._x,
          y: player._y,
        });

        break;
// eslint-disable-next-line no-case-declarations
      case Commands.ALTER_TILE:
        let tileId = cmd.params.tileId;

        this.world.changeTile(player._x, player._y, tileId);

        break;
      case Commands.COMMUNICATION:

        this.io.emit('playSound', {
          x: player._x,
          y: player._y,
        });
        break;
      default:
        logger.error(`Invalid Command ${cmd.type}`);
    }
  }

  /**
   * Add an input to the input-queue for the specific player, each queue is
   * key'd by step, because there may be multiple inputs per step.
   * @param data
   * @param playerId
   */
  queueInputForPlayer(data, playerId) {
    // create an input queue for this player, if one doesn't already exist
    if (!this.playerInputQueues.hasOwnProperty(playerId)) {
      this.playerInputQueues[playerId] = {};
    }
    let queue = this.playerInputQueues[playerId];

    logger.debug(queue);

    // create an array of inputs for this step, if one doesn't already exist
    if (!queue[data.step]) queue[data.step] = [];

    // add the input to the player's queue
    queue[data.step].push(data);
  }

  // /**
  //  *
  //  * @param data {{x, y}} Temp
  //  * @param socket {Socket}
  //  */
  // onReceivedSound(data, socket, playerId) {
  //   let player = this.world.objects.get(playerId);
  //   this.io.emit('playSound', {
  //     x: player.x,
  //     y: player.y,
  //   });
  // }
  //
  // getPlayerCount() {
  //   return this.connectedPlayers.size;
  // }
}

module.exports = Server;
