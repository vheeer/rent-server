const Base = require('./base.js');

module.exports = class extends Base {
    indexAction() {
        console.log("api/index/indexAction");
        return this.success("all right");
    }
};
