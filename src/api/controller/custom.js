import fs from 'fs';
import WechatPayment from "wx-payment";

const Base = require('./base.js');
const Rest = require('./rest.js');

// ES6
WechatPayment.transfers_promise = orderData => new Promise((resolve, reject) =>
  WechatPayment.transfers(orderData, function(err, result){
    if(err)
      reject(err);
    resolve(result);
  })
);

const namespace = 'custom';

const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    think.logger.info('api/shop/indexAction');
    const shops = await this.model('shop').select();
    return this.success(shops);
  }
  async idcardAction() {
    const { type } = this.get();
    // 图像上传至对象储存
    const { Bucket, SecretId, SecretKey } = this.config('cos');

    const save = this.service('savefile', SecretId, SecretKey, Bucket);
    const { err, url: idCardUrl } = await save.saveToCloud(this.file(), 'upload/idcard/');
    if (err) return this.fail('图片存储错误');
    // 识别身份证内容
    const { appkey, appid } = this.config('ai');

    const bitmap = fs.readFileSync(this.file()['vheeer'].path);
    const base64 = Buffer.from(bitmap).toString('base64');

    const aiParams = {
      'app_id': appid,
      'time_stamp': parseInt(Date.now() / 1000),
      'nonce_str': think.uuid(32).replace(/-/g, ''),
      'image': base64,
      'card_type': type,
      'sign': ''
    };

    const AI = this.service('tencentai', aiParams, appkey);
    let result = await AI.idcard();
    result = JSON.parse(result);
    const { msg, data } = result;
    if (msg !== 'ok') {
      return this.fail('识别错误');
    }
    // 识别结果
    let customData;
    if (type === '0') {
      customData = {
        real_name: data.name,
        gender: data.sex === '男' ? 1 : (data.name === '女' ? 2 : 0),
        nation: data.nation,
        birthday: parseInt(new Date(data.birth).getTime() / 1000),
        address: data.address,
        card_id: data.id,
        idcard_positive_img_url: idCardUrl
      };
    } else if (type === '1') {
      customData = {
        idcard_authority: data.authority,
        idcard_valid_date: data.valid_date,
        idcard_opposite_img_url: idCardUrl
      };
    }
    // 是否有未识别出的项
    let haveEmpty = false;
    Object.keys(customData).forEach(key => {
      const v = customData[key];
      if (v === undefined || v === null || v === '') {
        haveEmpty = true;
      }
    });
    if (haveEmpty === true) {
      return this.fail('识别不完整，请重新上传');
    }
    // 存储、返回
    await this.model('custom').where({ id: this.ctx.state.user_id }).update(customData);
    return this.success(idCardUrl);
  }
  async getuserinfoAction() {
    const result = await this.model('custom').getuserinfo(this.ctx.state.user_id);
    return this.success(result);
  }
  async rechargeAction() {
    const that = this;
    const { total_fee } = this.post();

    const { notifyUrls: { recharge: recharge_notify } } = this.config('weixin');

    const { user_id } = this.ctx.state;

    const { openid, is_paid } = await this.model('custom').where({ id: user_id }).find();

    if (think.isEmpty(openid)) {
      return this.fail('找不到openid，微信支付失败');
    }

    const outTradeNo = Date.now() + '' + Math.round(new Date().getTime() / 1000);
    const recharge_sn = this.model('order').generateOrderNumber();
    const now = parseInt(Date.now() / 1000);
    const rechargeParams = {
      user_id,
      recharge_sn,
      total_fee,
      out_trade_no: outTradeNo,
      add_time: now
    };
    console.log('rechargeParams', rechargeParams);
    const addResult = await this.model('recharge').add(rechargeParams);
    console.log('addResult', addResult);
    const WeixinSerivce_params = {
      // 非服务商模式
      is_sub: 0,
      appid: that.config('weapp.appid'),
      mch_id: that.config('partner.mchId'),
      partner_key: that.config('partner.partnerKey'),
      openid
    };

    const WeixinSerivce = this.service('weixin', 'api', WeixinSerivce_params);
    try {
      // 统一下单
      const returnParams = await WeixinSerivce.createUnifiedOrder({
        body: '商户订单：' + outTradeNo,
        out_trade_no: outTradeNo,
        total_fee,
        notify_url: recharge_notify,
        spbill_create_ip: '',
        attach: `is_sub=0&user_id=${user_id}&is_paid=${is_paid}`
      });
      console.log('统一下单返回：', returnParams);
      return this.success(returnParams);
    } catch (err) {
      think.logger.warn('微信支付失败', err);
      return this.fail('微信支付失败');
    }
  }
  async withdrawAction() {
    let close = false;
    // close = true;
    if (close) {
      return this.fail('请联系客服')
    }
    const { currentAccount } = this.ctx.state;

    const { user_id } = this.ctx.state;
    const notify_url = this.config("weixin.notifyUrls.withdraw");
    const certRoot = this.config("certRoot"); //证书根目录
    const pfx = fs.readFileSync(certRoot + currentAccount + '/apiclient_cert.p12'); //证书文件

    const appid = this.config("weapp.appid");
    const partner_key = this.config("partner.partnerKey");
    const mch_id = this.config("partner.mchId");

    const { openid, cash_paid, balance, deposit, real_name } = await this.model("custom").where({ id: user_id }).limit(1).find();

    // 获取押金和余额
    const amount = parseInt(deposit) + parseInt(balance);

    if (balance <= 0 && deposit <= 0) {
      return this.fail('余额不足');
    }

    //微信支付参数
    let options = {
      appid,
      mch_id,
      notify_url,
      pfx, //微信商户平台证书 (optional，部分API需要使用)
      apiKey: partner_key, //微信商户平台API密钥
      trade_type: 'JSAPI' //APP, JSAPI, NATIVE etc.
    };
    console.log("微信支付参数: ", options);

    WechatPayment.init(options);

    let orderData = {
      partner_trade_no: Date.now() + "" + Math.round(new Date().getTime()/1000), //商户订单号，需保持唯一性
      openid,
      check_name: 'OPTION_CHECK',
      re_user_name: real_name,
      amount,
      desc: '付款',
      spbill_create_ip: '192.168.0.1'
    }
    console.log("退款订单：", orderData);

    const result = await WechatPayment.transfers_promise(orderData);
    console.log('退款结果', result);
    if (result.result_code === 'SUCCESS') {
      const thisTime = parseInt(Date.now() / 1000);

      const add_cash_paid_result = await this.model('user').where({ id: user_id }).update({ deposit: 0, balance: 0 });

      // const addRes = await this.model("withdraw").add({
      //   user_id,
      //   amount: parseAmount,
      //   add_time: thisTime
      // })

      if (!think.isEmpty(addRes)) {
        return this.success(add_cash_paid_result);
      } else {
        return this.fail('未成功添加提现记录');
      }
    } else {
      let mes = result.return_msg;
      if (result.err_code === 'SENDNUM_LIMIT')
        mes = '超出今日提现上限';
      else if (result.err_code === 'NAME_MISMATCH')
        mes = '真实姓名不一致'
      return this.fail('提现错误：' + mes);
    }
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
