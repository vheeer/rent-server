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

    const { out_trade_no, attach } = result;

    const recharge = await this.model('recharge').where({ out_trade_no }).find();

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

    if (updateRes) {
    } else {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
  }
};
