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
    const { user_id } = this.ctx.state;
    // 个人信息完整检测
    const { checkMes, userInfo: { mobile, user_real_name, position } } = await this.model('custom').check(user_id);
    if (checkMes) {
      return this.fail(checkMes);
    }
    // 最新订单状态
    const lastOrder = await this.model('order').order('id desc').limit(1).find();
    if (!think.isEmpty(lastOrder)) {
      if (lastOrder.order_status === 1) {
        return this.fail(1001, '请等待工作人员确认开始使用');
      }
      if (lastOrder.order_status === 2) {
        return this.fail(1002, '您有正在进行中的订单');
      }
      if (lastOrder.order_status === 3) {
        return this.fail(1003, '请等待工作人员确认还车');
      }
    }
    // 生成新订单
    const order_sn = this.model(namespace).generateOrderNumber();
    const { shop_id, price, unit } = await this.model('goods').where({ id: goods_id }).find();
    const now = parseInt(Date.now() / 1000);

    const createOptions = {
      order_sn,
      goods_id,
      shop_id,
      user_id,
      order_status: 1,
      mobile,
      unit_price: price,
      order_price: price,
      actual_price: price,
      unit,
      user_real_name,
      position,
      add_time: now
    };
    const result = await this.model(namespace).add(createOptions);
    return this.success(result);
  }
  async endAction() {
    const { order_id } = this.get();

    const now = parseInt(Date.now() / 1000);

    const result = await this.model(namespace).where({ id: order_id }).update({ order_status: 3, end_time: now });
    return this.success(result);
  }
  async firstAction() {
    const firstOrder = await this.model(namespace).getFirstOrder(this.ctx.state.user_id);
    return this.success(firstOrder);
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
