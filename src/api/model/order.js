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
  async getFirstOrder(user_id) {
    const data = await this.model('order').order('add_time desc').where({ user_id }).limit(1).find();
    // 如果有关联查询，把查询结果扁平化（comment）
    const check = () => {
      let have_ = false;
      [data].forEach(row => {
        // 单条数据记录
        Object.keys(row).forEach(key => {
          // 单个字段
          if (row[key] instanceof Object) {
            have_ = true;
            // 对象字段
            Object.keys(row[key]).forEach(relationKey => {
              row[key + '_' + relationKey] = row[key][relationKey];
            });
            delete row[key];
          }
        });
      });
      return have_;
    };
    while (check()) {
      check();
    }
    return data;
  }
  /**
   * 更改订单支付状态
   * @param out_trade_no
   * @param payStatus
   * @returns {Promise.<boolean>}
  */
  async updatePayStatus(out_trade_no, payStatus = 0) {
    return this.where({ out_trade_no }).limit(1).update({ pay_status: parseInt(payStatus) });
  }
};
