// default config
module.exports = {
  authIgnore: [
    // 不需要验证授权的接口
  ],
  ingoreURL: [
    // 跳过前置操作的接口
    'pay/notify'
  ],
  publicController: [
    // 可以公开访问的Controller
    'goods',
    'shop'
  ],
  publicAction: [
    // 可以公开访问的Action
    'auth/login'
  ]
};
