let { MovingObject } = require('./moving_object');

class Model extends MovingObject {
  constructor() {
    super();
    this.onActionBlockId = '';
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }

  setOnActionBlockId(onActionBlockId) {
    this.onActionBlockId = onActionBlockId;
  }
}

module.exports.Model = Model;