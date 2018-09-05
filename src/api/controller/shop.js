const Base = require('./base.js');
const Rest = require('./rest.js');

const namespace = 'shop';
const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    think.logger.info('api/shop/indexAction');
    const shops = await this.model('shop').select();
    return this.success(shops);
  }
  async getshopAction() {
    const allShop = await this.model(namespace).where({ is_open: 1 }).select();
    think.logger.info(allShop);
    return this.success(allShop);
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
