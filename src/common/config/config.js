// default config
module.exports = {
  port: 8361,
  workers: 1,
  certRoot: '', // 证书
  filePath: '', // 服务器文件储存
  weapp: {
    appid: 'wxbd3457302f9c2d31', // 小程序appid
    appSecret: 'e8cf754ee51bb6346956edea7f5dbb86' // 小程序秘钥
  },
  partner: {
    // 使用普通商户模式支付
    mchId: '1494794472', // 商户id
    partnerKey: '' // 商户支付秘钥
  },
  operator: {
    // 使用服务商模式支付
    appid: '', // 服务商服务号appid
    mchId: '', // 服务商商户id
    partnerKey: '' // 服务商秘钥
  },
  weixin: {
    notifyUrl: 'http:127.0.0.1:8361/api/pay/notify' // 微信支付异步通知
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
