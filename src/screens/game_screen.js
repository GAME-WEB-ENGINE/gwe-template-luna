let { GWE } = require('gwe');
let { Room } = require('../entities/room');

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.player = null;
    this.room = null;
  }

  onEnter() {
    this.player = this.app.getPlayer();
    this.loadRoom('./assets/rooms/sample00/data.room', 'Spawn0000');
  }

  handleEvent(event) {
    if (!this.room) {
      return;
    }

    this.room.handleEvent(event);
  }

  update(ts) {
    if (!this.room) {
      return;
    }

    this.room.update(ts);
  }

  draw(viewIndex) {
    if (!this.room) {
      return;
    }

    this.room.draw(viewIndex);
  }

  async loadRoom(path, spawnName) {
    this.room = await Room.createFromFile(path, this.player, spawnName);
  }
}

module.exports.GameScreen = GameScreen;