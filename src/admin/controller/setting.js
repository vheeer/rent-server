const Base = require('./base.js');

const fs = require('fs');
const path = require('path');

const settingPath = path.join(__dirname, '../../../setting/config.xml');

class Controller extends Base {
  async findAction() {
    const configXML = fs.readFileSync(settingPath, 'utf-8');
    return this.success(configXML);
  }
  async updateAction() {
    console.log('Object.keys(this.ctx.req)', Object.keys(this.ctx.req));
    console.log('Object.keys(this.ctx.request)', Object.keys(this.ctx.request));
    console.log('this.ctx.request.body', this.ctx.request.body);
    const data = this.ctx.request.body;

    const result = fs.writeFileSync(settingPath, data, 'utf-8');

    return this.success(result);
  }
}
module.exports = Controller;
