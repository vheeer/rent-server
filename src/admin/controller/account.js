const Base = require('./base.js');
const Rest = require('./rest.js');

const namespace = 'account';

const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    const result = await this.model(namespace).limit(100).select();
    return this.success(result);
  }

  async getuserAction() {
    const data = {
      name: 'Messi',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      notifyCount: 19
    };
    return this.success(data);
  }

  async loginAction() {
    const { userName, password, type, autoLogin } = this.post();
    const logResult = await this.model('account').where({ username: userName, password }).find();
    if (!think.isEmpty(logResult)) {
      const { role } = logResult;
      // 生成秘钥
      const AS = this.service('account');
      const token = AS.getToken(userName);
      // cookie
      const maxAge = autoLogin === 'true' ? 7 * 24 * 3600 * 1000 : null;
      await this.cookie('userName', userName, { maxAge });
      await this.cookie('token', token, { maxAge });
      // session
      await this.session('userName', userName);
      await this.session('token', token);
      const allSessions = await this.session();
      think.logger.debug('sessionData: ', allSessions);
      // 缓存
      await this.ctx.cache(userName, token);
      const currentCaches = await this.ctx.cache(userName);
      think.logger.debug('currentCaches: ', currentCaches);
      return this.success({
        status: 'ok',
        currentAuthority: role.name,
        type
      });
    }
    return this.success('success--');
  }
}

Object.assign(Controller.prototype, actions);
module.exports = Controller;
