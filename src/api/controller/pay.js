/* eslint-disable no-multi-spaces */
const Base = require('./base.js');

module.exports = class extends Base {
  async rechangeAction() {

  }
  async notify_rechargeAction() {
    console.log('----------------充值结果反馈----------------');
    const WeixinSerivce = this.service('weixin', 'api');
    console.log("this.post('xml')", this.post('xml'));

    const result = await WeixinSerivce.payNotify(this.post('xml'), this);

    console.log('notify post XML', result);
    if (!result) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`;
    }

    const { out_trade_no, attach, total_fee, user_id } = result;

    const { balance, deposit, is_paid } = await this.model('custom').where({ id: user_id }).find();
    const recharge = await this.model('recharge').where({ out_trade_no }).find();

    const xmlRoot = await this.service('getsetting').getobj();
    const standard_deposit = xmlRoot.weapp[0].setting[0].deposit[0]._;

    console.log('result.out_trade_no is ', result.out_trade_no);
    console.log('recharge is ', recharge); // 如果已经收到支付成功该信息则返回错误

    if (think.isEmpty(recharge)) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    if (recharge.pay_status === 2) {
      think.logger.info('已经支付成功');
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[已经支付成功]]></return_msg></xml>`;
    }
    const updateParams = {
      attach,
      result: JSON.stringify(result),
      pay_status: 2
    };

    console.log('updateParmes', updateParams)

    const updateRes = await this.model('recharge').where({ out_trade_no: out_trade_no }).update(updateParams);
    if (!updateRes) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }
    // 充值计算器
    const calc = (deposit, standard_deposit, total_fee) => {
      const restDeposit = standard_deposit - deposit; // 需要冲到押金的值
      const balanceAdd = total_fee - restDeposit; // 实际冲到余额的值
      const depositAdd = balanceAdd > 0 ? restDeposit : total_fee; // 实际冲到押金的值
      return {
        depositAdd,
        balanceAdd
      }
    }
    console.log('----------', deposit, standard_deposit, total_fee);
    const { depositAdd, balanceAdd } = calc(deposit, standard_deposit, total_fee); // 需要修改的字段
    // 修改押金
    if (depositAdd > 0) {
      const updateDepositRes = await this.model('custom').increase('deposit', depositAdd, { id: user_id });
      if (!updateDepositRes) {
        return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[用户不存在]]></return_msg></xml>`;
      }
    }
    // 修改余额
    if (balanceAdd > 0) {
      const updateBalanceRes = await this.model('custom').increase('balance', balanceAdd, { id: user_id });
      if (!updateBalanceRes) {
        return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[用户不存在]]></return_msg></xml>`;
      }
    }
    // 用户成为已支付过的状态
    if (parseInt(is_paid) === 0) {
      const updatePaidRes = await this.model('custom').where({ id: user_id }).update({ is_paid: 1 });
      if (!updatePaidRes) {
        return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[用户不存在]]></return_msg></xml>`;
      }
    }

    return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
  }
};
