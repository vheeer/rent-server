const Base = require('./base.js');

const fs = require('fs');
const path = require('path');

class Controller extends Base {
  async indexAction() {
    const configXML = fs.readFileSync(path.join(__dirname, '../../../setting/config.xml'), 'utf-8');
    return this.success(configXML);
  }
}
module.exports = Controller;
