const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('event', () => console.log('FUCK'));

module.exports = emitter;
