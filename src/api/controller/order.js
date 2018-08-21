const Base = require('./base.js');
const Rest = require('./rest.js');

const namespace = 'order';

const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    const result = await this.model(namespace).limit(100).select();
    return this.success(result);
  }
  async startAction() {
    const { goods_id } = this.post();
    const order_sn = this.model(namespace).generateOrderNumber();
    const { user_id } = this.ctx.state;
    const { mobile } = await this.model('custom').where({ id: user_id }).find();
    const { shop_id, price, unit } = await this.model('goods').where({ id: goods_id }).find();

    const now = parseInt(Date.now() / 1000);

    const createOptions = {
      order_sn,
      goods_id,
      shop_id,
      user_id,
      order_status: 1,
      mobile,
      start_time: now,
      unit_price: price,
      order_price: price,
      actual_price: price,
      unit,
      add_time: now
    };
    const result = await this.model(namespace).add(createOptions);
    return this.success(result);
  }
  async firstAction() {
    const firstOrder = await this.model(namespace).getFirstOrder(this.ctx.state.user_id);
    return this.success(firstOrder);
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
