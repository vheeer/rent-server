const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    console.log("admin/index/indexAction");
    return this.success("all right change");
  }
};
