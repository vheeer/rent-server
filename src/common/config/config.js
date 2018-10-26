// default config
const port = 8361;
const host = 'http:127.0.0.1:' + port;
module.exports = {
  port,
  workers: 1,
  certRoot: '', // 证书
  filePath: '', // 服务器文件储存
  weapp: {
    appid: 'wx59b2adb6fcd71a17', // 小程序appid
    appSecret: 'c516ee5e0ca1f9d52176904ed5b3f602' // 小程序秘钥
  },
  partner: {
    // 使用普通商户模式支付
    mchId: '1516200031', // 商户id
    partnerKey: 'dapingkejidapingkejidapingkejida' // 商户支付秘钥
  },
  operator: {
    // 使用服务商模式支付
    appid: '', // 服务商服务号appid
    mchId: '', // 服务商商户id
    partnerKey: '' // 服务商秘钥
  },
  weixin: {
    notifyUrls: {
      // 微信支付异步通知
      recharge: host + '/api/pay/notify_recharge'
    }
  },
  ai: {
    appid: '1106977728',
    appkey: 'jqmzvOHegtvVLWEo'
  },
  cos: {
    // 腾讯云对象储存服务
    Bucket: 'rent-1256171234', // 腾讯云对象储存-储存桶
    SecretId: 'AKIDPhniS2UceT6XnqrWFqJagcMuIYcTcar6',
    SecretKey: 'DGNODsLdjeOvFOQHyVs44sVx35zjHeq5'
  }
};
