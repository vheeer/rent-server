const Base = require('./base.js');
const Rest = require('./rest.js');

const namespace = 'goods';

const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    think.logger.info('api/shop/indexAction');
    const shops = await this.model('shop').select();
    return this.success(shops);
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
