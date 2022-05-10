let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');

class MovingObject extends GWE.GfxJAS {
  constructor() {
    super();
    this.direction = DIRECTION.FORWARD;
    this.radius = 0;
    this.speed = 3;
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

  getSpeed() {
    return this.speed;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  getMoveDir() {
    if (this.direction == DIRECTION.FORWARD) {
      return GWE.Utils.VEC3_FORWARD;
    }
    else if (this.direction == DIRECTION.BACKWARD) {
      return GWE.Utils.VEC3_BACKWARD;
    }
    else if (this.direction == DIRECTION.LEFT) {
      return GWE.Utils.VEC3_LEFT;
    }
    else if (this.direction == DIRECTION.RIGHT) {
      return GWE.Utils.VEC3_RIGHT;
    }
    else {
      return GWE.Utils.VEC3_ZERO;
    }
  }
}

module.exports.MovingObject = MovingObject;