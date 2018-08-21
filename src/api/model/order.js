const _ = require('lodash');

module.exports = class extends think.Model {
  get relation() {
    return {
      goods: {
        model: 'goods',
        type: think.Model.BELONG_TO,
        field: 'id, goods_sn, shop_id'
      }
    };
  }
  /**
   * 生成订单的编号order_sn
   * @returns {string}
   */
  generateOrderNumber() {
    const date = new Date();
    return date.getFullYear() + _.padStart(date.getMonth(), 2, '0') + _.padStart(date.getDay(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + _.random(100000, 999999);
  }
  /*
    查找用户最新的订单
    @returns {int}
  */
  getFirstOrder(user_id) {
    return this.model('order').order('add_time desc').where({ user_id }).limit(1).find();
  }
};
