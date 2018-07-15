const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    console.log("admin/index/indexAction");
    return this.success("all right client_1");
    
    return this.success("all right server_3");
  }
};
