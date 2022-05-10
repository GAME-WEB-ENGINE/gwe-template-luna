let fs = require('fs');

class Player {
  constructor(data) {
    this.variants = {};

    if (!data.hasOwnProperty('Variants')) {
      return;
    }

    for (let key in data['Variants']) {
      this.addVariant(key, data['Variants'][key]);
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new Player(data);
  }

  addVariant(varloc, value) {
    if (this.variants.hasOwnProperty(varloc)) {
      throw new Error('Player::addVariant: varloc already exist in variants dictionnary');
    }

    this.variants[varloc] = value;
  }

  removeVariant(varloc) {
    if (!this.variants.hasOwnProperty(varloc)) {
      throw new Error('Player::removeVariant: varloc not exist in variants dictionnary');
    }

    delete this.variants[varloc];
  }

  setVariant(varloc, value) {
    if (!this.variants.hasOwnProperty(varloc)) {
      throw new Error('Player::setVariant: varloc not exist in variants dictionnary');
    }

    this.variants[varloc] = value;
  }

  hasVariant(varloc) {
    return this.variants.hasOwnProperty(varloc);
  }

  getVariant(varloc) {
    if (!this.variants.hasOwnProperty(varloc)) {
      throw new Error('Player::getVariant: varloc not exist in variants dictionnary');
    }

    return this.variants[varloc];
  }
}

module.exports.Player = Player;