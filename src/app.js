window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { Player } = require('./src/core/player');
  let { BootScreen } = require('./src/screens/boot_screen');
  
  class Game extends GWE.Application {
    constructor(resolutionWidth, resolutionHeight, sizeMode) {
      super(resolutionWidth, resolutionHeight, sizeMode);
      this.player = Player.createFromFile('./assets/player.json');
    }
  
    getPlayer() {
      return this.player;
    }
  }

  let game = new Game(600, 600, GWE.SizeModeEnum.FIXED);
  GWE.screenManager.requestSetScreen(new BootScreen(game));
  requestAnimationFrame(ts => game.run(ts));
});