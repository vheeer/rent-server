// default config
module.exports = {
  authIgnore: [
    // 不需要验证授权的接口
  ],
  ingoreURL: [
    // 跳过前置操作的接口
  ],
  publicController: [
    // 可以公开访问的Controller
    'goods',
    'shop',
    'setting'
  ],
  publicAction: [
    // 可以公开访问的Action
    'auth/login',
    'pay/notify_recharge'
  ]
};
