let { GWE } = require('gwe');

let ORTHO_SIZE = 8.4;
let ORTHO_DEPTH = 100;
let MATRIX = [1.0000, 0.0000, -0.0000, 0.0000, -0.0000, 0.0000, -1.0000, 0.0000, -0.0000, 1.0000,  0.0000, 0.0000, -0.0000, 8.4545,  0.0000, 1.0000];
let PIXEL_PER_UNIT = 32;
let BILLBOARD_ROTATION = [1.57, 0, 0];

class CameraFollow {
  constructor() {
    this.targetDrawable = null;
    this.minClipOffset = [0, 0];
    this.maxClipOffset = [0, 0];
    this.view = GWE.gfxManager.getView(0);

    this.view.setProjectionMode(GWE.ProjectionModeEnum.ORTHOGRAPHIC);
    this.view.setOrthographicSize(ORTHO_SIZE);
    this.view.setOrthographicDepth(ORTHO_DEPTH);
    this.view.setCameraMatrix(MATRIX);
    GWE.gfxManager.setShowDebug(true);
  }

  getTargetDrawable() {
    return this.targetDrawable;
  }

  setTargetDrawable(targetDrawable) {
    this.targetDrawable = targetDrawable;
  }

  setMinClipOffset(minClipOffsetX, minClipOffsetY) {
    this.minClipOffset[0] = minClipOffsetX;
    this.minClipOffset[1] = minClipOffsetY;
  }

  setMaxClipOffset(maxClipOffsetX, maxClipOffsetY) {
    this.maxClipOffset[0] = maxClipOffsetX;
    this.maxClipOffset[1] = maxClipOffsetY;
  }

  update(ts) {
    let clipOffset = this.view.getClipOffset();
    let worldPosition = this.targetDrawable.getPosition();
    let screenPosition = GWE.gfxManager.getScreenPosition(0, worldPosition[0], worldPosition[1], worldPosition[2]);

    this.view.setClipOffset([
      GWE.Utils.CLAMP(screenPosition[0] + clipOffset[0], this.minClipOffset[0], this.maxClipOffset[0]),
      GWE.Utils.CLAMP(screenPosition[1] + clipOffset[1], this.minClipOffset[1], this.maxClipOffset[1])
    ]);
  }
}

module.exports.CameraFollow = CameraFollow;
module.exports.PIXEL_PER_UNIT = PIXEL_PER_UNIT;
module.exports.BILLBOARD_ROTATION = BILLBOARD_ROTATION;