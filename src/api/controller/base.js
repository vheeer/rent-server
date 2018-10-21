module.exports = class extends think.Controller {
  async __before() {
    think.logger.info('***********************api before***********************');
    const _this = this;
    const database = 'rent';

    const ingoreURL = this.config('ingoreURL');

    const controller = this.ctx.controller;
    const action = this.ctx.action;
    const path = controller + '/' + action;

    // IP
    const IP = this.ctx.header['x-forwarder-for'];
    this.ctx.state.IP = IP;

    // 指定URL跳过前置操作
    if (ingoreURL.includes(path)) {
      return;
    }
    // 多商户
    this.model_1 = this.model;
    this.model = (function(modelCom) {
      return function(name, modelSpe, m) {
        return _this.model_1(name, modelSpe || modelCom, m);
      };
    }(database));
    // 用户Id
    think.token = this.ctx.header['x-nideshop-token'] || '';
    const tokenSerivce = this.service('token', 'api');
    const user_id = await tokenSerivce.getUserId();
    this.ctx.state.user_id = user_id;
    // 如果为非公开，则验证用户是否登录
    const publicController = this.config('publicController');
    const publicAction = this.config('publicAction');
    if (!publicController.includes(controller) && !publicAction.includes(path)) {
      if (user_id <= 0) {
        return this.fail(401, '请先登录');
      }
    }
  }
};
