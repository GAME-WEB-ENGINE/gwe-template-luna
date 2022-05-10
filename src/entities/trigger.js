let { GWE } = require('gwe');

class Trigger extends GWE.GfxDrawable {
  constructor() {
    super();
    this.radius = 0;
    this.hovered = false;
    this.onEnterBlockId = '';
    this.onLeaveBlockId = '';
    this.onActionBlockId = '';
  }

  draw(viewIndex) {
    GWE.gfxManager.drawDebugSphere(this.getModelMatrix(), this.radius, 2, [1, 0, 1]);
  }

  getRadius() {
    return this.radius;
  }

  setRadius(radius) {
    this.radius = radius;
  }

  isHovered() {
    return this.hovered;
  }

  setHovered(hovered) {
    this.hovered = hovered;
  }

  getOnEnterBlockId() {
    return this.onEnterBlockId;
  }

  setOnEnterBlockId(onEnterBlockId) {
    this.onEnterBlockId = onEnterBlockId;
  }

  getOnLeaveBlockId() {
    return this.onLeaveBlockId;
  }

  setOnLeaveBlockId(onLeaveBlockId) {
    this.onLeaveBlockId = onLeaveBlockId;
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }

  setOnActionBlockId(onActionBlockId) {
    this.onActionBlockId = onActionBlockId;
  }
}

module.exports.Trigger = Trigger;