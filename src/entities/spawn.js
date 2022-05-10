let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');

class Spawn extends GWE.GfxDrawable {
  constructor() {
    super();
    this.name = '';
    this.direction = DIRECTION.FORWARD;
    this.radius = 1;
  }

  draw(viewIndex) {
    GWE.gfxManager.drawDebugSphere(this.getModelMatrix(), this.radius, 2, [1, 0, 1]);
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getDirection() {
    return this.direction;
  }

  setDirection(direction) {
    this.direction = direction;
  }

  getRadius() {
    return this.radius;
  }

  setRadius(radius) {
    this.radius = radius;
  }
}

module.exports.Spawn = Spawn;