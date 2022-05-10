let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');

class Model extends GWE.GfxJAS {
  constructor() {
    super();
    this.direction = DIRECTION.FORWARD;
    this.radius = 0;
    this.onActionBlockId = '';
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

  getOnActionBlockId() {
    return this.onActionBlockId;
  }

  setOnActionBlockId(onActionBlockId) {
    this.onActionBlockId = onActionBlockId;
  }
}

module.exports.Model = Model;