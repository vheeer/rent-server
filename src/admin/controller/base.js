module.exports = class extends think.Controller {
  async __before() {
    think.logger.info('***********************admin before***********************');
    const _this = this;

    const database = 'rent';

    const environment = this.config('environment');
    const authIgnore = this.config('authIgnore');

    const controller = this.ctx.controller;
    const action = this.ctx.action;
    const path = controller + '/' + action;

    // IP
    const IP = this.ctx.header['x-forwarder-for'];
    this.ctx.state.IP = IP;

    // 多商户
    this.model_1 = this.model;
    this.model = (function(modelCom) {
      return function(name, modelSpe, m) {
        return _this.model_1(name, modelSpe || modelCom, m);
      };
    }(database));
    // 开发环境设置头信息
    // if (environment !== 'production') {
    //   this.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
    //   this.header('Access-Control-Allow-Headers', 'withcredentials');
    //   // this.header('Access-Control-Allow-Credentials', 'true');
    // }
      // this.header('Access-Control-Allow-Origin', '*');
      // this.header('Access-Control-Allow-Headers', 'withcredentials');
      // this.header('Access-Control-Allow-Credentials', 'true');
    if (!(authIgnore.includes(path))) {
      // 请求需要登录校验
      const userName = this.cookie('userName');
      const token = this.cookie('token');
      const vheeer = this.cookie('vheeer');
      // 检查用户名和秘钥是否存在
      const noAuth = {
        timestamp: Date.now(),
        status: 403,
        error: 'Unauthorized',
        message: 'Unauthorize',
        path: '/base/category/list'
      };
      think.logger.info(userName);
      think.logger.info(token);
      think.logger.info(vheeer);
      if (think.isEmpty(userName) || think.isEmpty(token)) {
        think.logger.warn('用户名或秘钥不存在');
        this.status = 401;
        this.ctx.body = noAuth;
        return false;
      }
      // 比较缓存token
      const tokenCache = await this.cache(userName, userName => {
        const AS = _this.service('account');
        return AS.getToken(userName);
      });
      if (token !== tokenCache) {
        think.logger.warn('用户秘钥不匹配');
        this.status = 401;
        this.ctx.body = noAuth;
        return false;
      } else {
        this.ctx.state.userName = userName;
      }
    }
  }
};
