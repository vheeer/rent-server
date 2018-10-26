/* eslint-disable no-multi-spaces */
const Base = require('./base.js');

module.exports = class extends Base {
  async rechangeAction() {

  }
  async notify_rechargeAction() {
    think.logger.info('----------------充值结果反馈----------------');
    const WeixinSerivce = this.service('weixin', 'api');
    think.logger.info("this.post('xml')", this.post('xml'));

    const result = await WeixinSerivce.payNotify(this.post('xml'), this);

    think.logger.info('notify post XML', result);
    if (!result) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`;
    }

    const { out_trade_no, attch } = result;

    const recharge = await this.model('recharge').where({ out_trade_no }).find();

    think.logger.debug('result.out_trade_no is ', result.out_trade_no);
    think.logger.debug('recharge is ', recharge); // 如果已经收到支付成功该信息则返回错误

    if (think.isEmpty(recharge)) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    if (recharge.pay_status === 2) {
      think.logger.info('已经支付成功');
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[已经支付成功]]></return_msg></xml>`;
    }
    const updateParams = {
      attch,
      result,
      pay_status: 2
    };

    console.log('updateParmes', updateParams)

    if (this.model('recharge').update(updateParams).where({ out_trade_no: out_trade_no })) {
    } else {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
  }
};
