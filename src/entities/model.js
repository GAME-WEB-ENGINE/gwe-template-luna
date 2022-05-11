let { GWE } = require('gwe');

class Model extends GWE.GfxJAS {
  constructor() {
    super();
    this.radius = 0;
    this.onActionBlockId = '';
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