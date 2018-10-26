// production config, it will load in production enviroment
const port = 8360;
const host = 'https://www.dapingkeji.cn';
module.exports = {
  port,
  workers: 0,
  environment: 'production',
  weixin: {
    notifyUrls: {
      // 微信支付异步通知
      recharge: host + '/api/pay/notify_recharge'
    }
  }
};
