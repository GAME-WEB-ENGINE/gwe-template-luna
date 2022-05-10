let { GWE } = require('gwe');
let { GameScreen } = require('./game_screen');

class BootScreen extends GWE.Screen {
  constructor(app) {
    super(app);
  }

  onEnter() {
    this.uiMenu = new GWE.UIMenu();
    this.uiMenu.addWidget(new GWE.UIMenuText({ text: 'Commencer' }));
    GWE.uiManager.addWidget(this.uiMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)');
    GWE.uiManager.focus(this.uiMenu);

    GWE.eventManager.subscribe(this.uiMenu, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  onExit() {
    GWE.uiManager.removeWidget(this.uiMenu);
  }

  handleMenuItemSelected(data) {
    if (data.index == 0) {
      GWE.screenManager.requestSetScreen(new GameScreen(this.app));
    }
  }
}

module.exports.BootScreen = BootScreen;