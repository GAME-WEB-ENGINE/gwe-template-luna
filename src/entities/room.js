let fs = require('fs');
let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');
let { Spawn } = require('../entities/spawn');
let { Model } = require('../entities/model');
let { Trigger } = require('../entities/trigger');
let { Controller } = require('../entities/controller');
let { CameraFollow } = require('../entities/camera_follow');

let PIXEL_PER_UNIT = 32;
let BILLBOARD_ROTATION = [1.57, 0, 0];

class Room {
  constructor(player) {
    this.player = player;
    this.name = '';
    this.description = '';
    this.musicFile = '';
    this.map = null;
    this.walkmesh = null;
    this.controller = null;
    this.camera = null;
    this.scriptMachine = null;
    this.spawns = [];
    this.models = [];
    this.movers = [];
    this.triggers = [];
    this.running = true;

    this.scriptMachine = new GWE.ScriptMachine();
    this.scriptMachine.registerCommand('RUN', GWE.Utils.BIND(this.$run, this));
    this.scriptMachine.registerCommand('STOP', GWE.Utils.BIND(this.$stop, this));
    this.scriptMachine.registerCommand('WAITPAD', GWE.Utils.BIND(this.$waitPad, this));
    this.scriptMachine.registerCommand('GOTO', GWE.Utils.BIND(this.$goto, this));
    this.scriptMachine.registerCommand('GOTO_IF', GWE.Utils.BIND(this.$gotoIf, this));
    this.scriptMachine.registerCommand('EXEC_IF', GWE.Utils.BIND(this.$execIf, this));
    this.scriptMachine.registerCommand('VAR_SET', GWE.Utils.BIND(this.$varSet, this));
    this.scriptMachine.registerCommand('VAR_ADD', GWE.Utils.BIND(this.$varAdd, this));
    this.scriptMachine.registerCommand('VAR_SUB', GWE.Utils.BIND(this.$varSub, this));
    this.scriptMachine.registerCommand('DELAY', GWE.Utils.BIND(this.$delay, this));
    this.scriptMachine.registerCommand('UI_CREATE_DIALOG', GWE.Utils.BIND(this.$uiCreateDialog, this));
    this.scriptMachine.registerCommand('UI_CREATE_CHOICES', GWE.Utils.BIND(this.$uiCreateChoices, this));
    this.scriptMachine.registerCommand('UI_FADE_IN', GWE.Utils.BIND(this.$uiFadeIn, this));
    this.scriptMachine.registerCommand('UI_FADE_OUT', GWE.Utils.BIND(this.$uiFadeOut, this));
    this.scriptMachine.registerCommand('MODEL_PLAY_MOVER', GWE.Utils.BIND(this.$modelPlayMover, this));
    this.scriptMachine.registerCommand('MODEL_PLAY_ANIMATION', GWE.Utils.BIND(this.$modelPlayAnimation, this));
  }

  static async createFromFile(path, player, spawnName) {
    let json = JSON.parse(fs.readFileSync(path));
    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'ROOM') {
      throw new Error('Room::loadFromFile(): File not valid !');
    }

    let room = new Room(player);
    room.name = json['Name'];
    room.description = json['Description'];
    room.musicFile = json['MusicFile'];

    room.map = new GWE.GfxJSM();
    room.map.loadFromFile(json['MapFile']);
    room.map.setTexture(await GWE.textureManager.loadTexture(json['MapTextureFile']));

    room.walkmesh = new GWE.GfxJWM();
    room.walkmesh.loadFromFile(json['WalkmeshFile']);

    room.controller = new Controller();
    room.controller.loadFromFile(json['Controller']['JASFile']);
    room.controller.setTexture(await GWE.textureManager.loadTexture(json['Controller']['TextureFile']));
    room.controller.setOffset(json['Controller']['OffsetX'], json['Controller']['OffsetY']);
    room.controller.setRotation(BILLBOARD_ROTATION);
    room.controller.setPixelsPerUnit(PIXEL_PER_UNIT);
    room.controller.setRadius(json['Controller']['Radius']);
    room.controller.play('IDLE_FORWARD', true);

    room.camera = new CameraFollow();
    room.camera.setTargetDrawable(room.controller);
    room.camera.setMinClipOffset(json['CameraMinClipOffsetX'], json['CameraMinClipOffsetY']);
    room.camera.setMaxClipOffset(json['CameraMaxClipOffsetX'], json['CameraMaxClipOffsetY']);

    for (let obj of json['Spawns']) {
      let spawn = new Spawn();
      spawn.setName(obj['Name']);
      spawn.setPosition(obj['Position']);
      spawn.setRadius(0.2);
      spawn.setDirection(obj['Direction']);
      room.spawns.push(spawn);
    }

    for (let obj of json['Models']) {
      let model = new Model();
      model.loadFromFile(obj['JASFile']);
      model.setTexture(await GWE.textureManager.loadTexture(obj['TextureFile']));
      model.setOffset(obj['OffsetX'], obj['OffsetY']);
      model.setPosition(obj['Position']);
      model.setRotation(BILLBOARD_ROTATION);
      model.setPixelsPerUnit(PIXEL_PER_UNIT);
      model.setRadius(obj['Radius']);
      model.setOnActionBlockId(obj['OnActionBlockId']);
      model.play('IDLE_FORWARD', true);
      room.models.push(model);
    }

    for (let obj of json['Movers']) {
      let mover = new GWE.GfxMover();
      mover.setSpeed(obj['Speed']);
      mover.setPoints(obj['Points']);
      room.movers.push(mover);
    }

    for (let obj of json['Triggers']) {
      let trigger = new Trigger();
      trigger.setPosition(obj['Position']);
      trigger.setRadius(obj['Radius']);
      trigger.setOnEnterBlockId(obj['OnEnterBlockId']);
      trigger.setOnLeaveBlockId(obj['OnLeaveBlockId']);
      trigger.setOnActionBlockId(obj['OnActionBlockId']);
      room.triggers.push(trigger);
    }

    let spawn = room.spawns.find(spawn => spawn.getName() == spawnName);
    room.controller.setDirection(spawn.getDirection());
    room.controller.setPosition(spawn.position);

    room.scriptMachine.loadFromFile(json['ScriptFile']);
    room.scriptMachine.jump('ON_INIT');
    room.scriptMachine.setEnabled(true);

    return room;
  }

  handleEvent(event) {
    if (!this.running) {
      return;
    }

    if (event instanceof GWE.KeydownOnceEvent && event.key == GWE.InputKeyEnum.ENTER) {
      this.utilsControllerAction();
    }
  }

  update(ts) {
    this.updateControllerInput(ts);
    this.updateEntities(ts);
  }

  updateControllerInput(ts) {
    if (!this.running) {
      return;
    }

    let moving = false;

    if (GWE.inputManager.isKeyDown(GWE.InputKeyEnum.LEFT)) {
      moving = true;
      this.controller.setDirection(DIRECTION.LEFT);
    }
    else if (GWE.inputManager.isKeyDown(GWE.InputKeyEnum.RIGHT)) {
      moving = true;
      this.controller.setDirection(DIRECTION.RIGHT);
    }
    else if (GWE.inputManager.isKeyDown(GWE.InputKeyEnum.UP)) {
      moving = true;
      this.controller.setDirection(DIRECTION.FORWARD);
    }
    else if (GWE.inputManager.isKeyDown(GWE.InputKeyEnum.DOWN)) {
      moving = true;
      this.controller.setDirection(DIRECTION.BACKWARD);
    }

    if (moving) {
      this.utilsControllerMove(GWE.Utils.VEC3_SCALE(this.controller.getMoveDir(), this.controller.getSpeed() * (ts / 1000)));
      this.controller.play('RUN_' + this.controller.getDirection(), true);
    }
    else {
      this.controller.play('IDLE_' + this.controller.getDirection(), true);
    }
  }

  updateEntities(ts) {
    this.map.update(ts);
    this.walkmesh.update(ts);
    this.controller.update(ts);
    this.camera.update(ts);
    this.scriptMachine.update(ts);

    for (let spawn of this.spawns) {
      spawn.update(ts);
    }

    for (let model of this.models) {
      model.update(ts);
    }

    for (let mover of this.movers) {
      mover.update(ts);
    }

    for (let trigger of this.triggers) {
      trigger.update(ts);
    }
  }

  draw(viewIndex) {
    this.map.draw(viewIndex);
    this.walkmesh.draw(viewIndex);
    this.controller.draw(viewIndex);

    for (let spawn of this.spawns) {
      spawn.draw(viewIndex);
    }

    for (let model of this.models) {
      model.draw(viewIndex);
    }

    for (let mover of this.movers) {
      mover.draw(viewIndex);
    }

    for (let trigger of this.triggers) {
      trigger.draw(viewIndex);
    }
  }

  utilsControllerAction() {
    let position = this.controller.getPosition();
    let radius = this.controller.getRadius();
    let handPosition = this.controller.getHandPosition();

    for (let trigger of this.triggers) {
      if (GWE.Utils.VEC3_DISTANCE(trigger.getPosition(), position) <= radius + trigger.getRadius()) {
        if (trigger.getOnActionBlockId()) {
          this.scriptMachine.jump(trigger.getOnActionBlockId());
          return;
        }
      }
    }

    for (let model of this.models) {
      if (GWE.Utils.VEC3_DISTANCE(model.getPosition(), handPosition) <= model.getRadius()) {
        if (model.getOnActionBlockId()) {
          this.scriptMachine.jump(model.getOnActionBlockId());
          return;
        }
      }
    }
  }

  utilsControllerMove(velocity) {
    let radius = this.controller.getRadius();
    let nextPosition = GWE.Utils.VEC3_ADD(this.controller.getPosition(), velocity);

    for (let other of this.models) {
      if (GWE.Utils.VEC3_DISTANCE(other.getPosition(), nextPosition) <= radius + other.getRadius()) {
        return;
      }
    }

    let p0Elevation = this.walkmesh.getElevationAt(nextPosition[0], nextPosition[2]);
    let p1Elevation = this.walkmesh.getElevationAt(nextPosition[0] - radius, nextPosition[2]);
    let p2Elevation = this.walkmesh.getElevationAt(nextPosition[0] + radius, nextPosition[2]);
    if (p0Elevation == Infinity || p1Elevation == Infinity || p2Elevation == Infinity) {
      return;
    }

    this.controller.setPosition([nextPosition[0], p0Elevation, nextPosition[2]]);

    for (let trigger of this.triggers) {
      let distance = GWE.Utils.VEC3_DISTANCE(trigger.getPosition(), nextPosition);
      let distanceMin = radius + trigger.getRadius();

      if (trigger.getOnEnterBlockId() && !trigger.isHovered() && distance < distanceMin) {
        this.scriptMachine.jump(trigger.getOnEnterBlockId());
        trigger.setHovered(true);
      }
      else if (trigger.getOnLeaveBlockId() && trigger.isHovered() && distance > distanceMin) {
        this.scriptMachine.jump(trigger.getOnLeaveBlockId());
        trigger.setHovered(false);
      }
    }
  }

  $run() {
    this.running = true;
  }

  $stop() {
    this.running = false;
  }

  $waitPad() {
    this.scriptMachine.setEnabled(false);
    GWE.eventManager.subscribe(GWE.inputManager, 'E_KEYDOWN_ONCE', this, (data) => {
      if (data.key == GWE.InputKeyEnum.ENTER) {
        GWE.eventManager.unsubscribe(GWE.inputManager, 'E_KEYDOWN_ONCE', this);
        this.scriptMachine.setEnabled(true);
      } 
    });
  }

  $goto(jumpto) {
    return jumpto;
  }

  $gotoIf(varloc, cond, value, jumpto) {
    if (CHECK_CONDITION(this.player.getVariant(varloc), cond, value)) {
      return jumpto;
    }
  }

  $execIf(varloc, cond, value, cmd = { CommandName, CommandArgs }) {
    if (CHECK_CONDITION(this.player.getVariant(varloc), cond, value)) {
      this.scriptMachine.runCommand(cmd['CommandName'], cmd['CommandArgs']);
    }
  }

  $varSet(varloc, value) {
    this.player.setVariant(varloc, value);
  }

  $varAdd(varloc, value) {
    let variant = this.player.getVariant(varloc);
    this.player.setVariant(varloc, variant + value);
  }

  $varSub(varloc, value) {
    let variant = this.player.getVariant(varloc);
    this.player.setVariant(varloc, variant - value);
  }

  $delay(ms) {
    this.scriptMachine.setEnabled(false);
    window.setTimeout(() => this.scriptMachine.setEnabled(true), ms);
  }

  async $uiCreateDialog(author, text) {
    this.scriptMachine.setEnabled(false);
    let uiDialog = new GWE.UIDialog();
    uiDialog.setAuthor(author);
    uiDialog.setText(text);
    GWE.uiManager.addWidget(uiDialog);
    GWE.uiManager.focus(uiDialog);
    await GWE.eventManager.wait(uiDialog, 'E_CLOSE');
    GWE.uiManager.removeWidget(uiDialog);
    this.scriptMachine.setEnabled(true);
  }

  async $uiCreateChoices(author, text, choices = []) {
    this.scriptMachine.setEnabled(false);
    let uiDialog = new GWE.UIDialog();
    uiDialog.setAuthor(author);
    uiDialog.setText(text);
    GWE.uiManager.addWidget(uiDialog);
    await GWE.eventManager.wait(uiDialog, 'E_PRINT_FINISHED');

    let uiMenu = new GWE.UIMenu();
    GWE.uiManager.addWidget(uiMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)');
    for (let choice of choices) {
      uiMenu.addWidget(new GWE.UIMenuText({ text: choice['Text'] }));
    }

    GWE.uiManager.focus(uiMenu);
    let data = await GWE.eventManager.wait(uiMenu, 'E_MENU_ITEM_SELECTED');
    GWE.uiManager.removeWidget(uiDialog);
    GWE.uiManager.removeWidget(uiMenu);
    this.scriptMachine.jump(choices[data.index]['Jumpto']);
    this.scriptMachine.setEnabled(true);
  }

  $uiFadeIn(delay, ms, timingFunction) {
    this.scriptMachine.setEnabled(false);
    GWE.uiManager.fadeIn(delay, ms, timingFunction, () => this.scriptMachine.setEnabled(true));
  }

  $uiFadeOut(delay, ms, timingFunction) {
    this.scriptMachine.setEnabled(false);
    GWE.uiManager.fadeOut(delay, ms, timingFunction, () => this.scriptMachine.setEnabled(true));
  }

  $modelPlayMover(modelIndex, moverIndex) {
    let model = this.models[modelIndex];
    let mover = this.movers[moverIndex];
    mover.setDrawable(model);
    mover.play();
  }

  $modelPlayAnimation(modelIndex, animationName, isLooped) {
    let model = this.models[modelIndex];
    model.play(animationName, isLooped);
  }
}

module.exports.Room = Room;

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CHECK_CONDITION(value1, cond, value2) {
  return (cond == 'not equal' && value1 != value2) || (cond == 'equal' && value1 == value2) || (cond == 'is less than' && value1 < value2) || (cond == 'is greater than' && value1 > value2);
}