'use strict';

const World = require('./game/world.js');
const logger = require('./logger.js');
const {ServerConfig, WorldConfig, Commands} = require('../shared/constant.js');
const CommandFactory = require('./game/command');

/**
 * Server is the main server-side singleton code.
 * This class should not be used to contain the actual game logic.
 * Only logging gameplay statistics and registering user activity and user data.
 */
class Server {
  constructor(io) {
    /**
     * Key: Socket.id
     * @type {Map<String, Object>} HashTable that contains the currently.
     * connected players.
     */
    this.connectedPlayers = new Map();

    /**
     * @type {Map<Number, Array.<Function>>}
     */
    this.playerInputQueues = new Map();

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
    this.playerInputQueues.set(playerId, []);
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
    // TODO: Refactor

    let newX;
    let newY;
    do {
      newX = Math.floor(Math.random() * WorldConfig.WIDTH);
      newY = Math.floor(Math.random() * WorldConfig.HEIGHT);
    } while (!this.world.isPassable(newX, newY, 2));

    playerEvent.x = newX;
    playerEvent.y = newY;

    this.world.addObject(newX, newY, playerEvent.playerId);

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
    // this.queueInputForPlayer(cmd, playerId);
    const player = this.world.objects.get(playerId);

    let command;

    switch (cmd.type) {
      case Commands.MOVEMENT:
        command = CommandFactory.makeMoveCommand(player, cmd.params);
        break;
      case Commands.ALTER_TILE:
        command = CommandFactory.makeChangeTileCommand(player, cmd.params);
        break;
      case Commands.COMMUNICATION:
        command = CommandFactory.makeCommunicateCommand(player, cmd.params);
        break;
      default:
        logger.error(`Invalid Command ${cmd.type}`);
        return;
    }

    logger.debug(`Processing input <${cmd.type}> from playerId ${playerId}`);
    this.world.processInput(command);
  }

  /**
   * Add an input to the input-queue for the specific player, each queue is
   * key'd by step, because there may be multiple inputs per step.
   * @param cmd
   * @param playerId
   */
  queueInputForPlayer(cmd, playerId) {
    let queue = this.playerInputQueues.get(playerId);

    queue.push();

    logger.data(queue);
  }
}

module.exports = Server;
