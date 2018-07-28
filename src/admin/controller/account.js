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
  async registerAction() {
    const { mail: userName, password } = this.post();
    const { id: adminRoleId } = await this.model('role').where({ name: 'admin' }).limit(1).find();
    let result;
    try {
      result = await this.model('account').add({
        username: userName,
        password,
        role_id: adminRoleId,
        add_time: parseInt(Date.now() / 1000)
      });
    } catch (e) {
      think.logger.error('****************注册错误****************');
      if (e.code === 'ER_DUP_ENTRY') {
        think.logger.error('用户名已存在 e.code', e.code);
        this.ctx.body = {status: 'fail', errno: e.code};
      }
      return;
    }
    if (!think.isEmpty(result)) {
      think.logger.info('****************成功注册****************');
      // 生成秘钥
      const AS = this.service('account');
      const token = AS.getToken(userName);
      // cookie
      const maxAge = null;
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
      // 输出信息
      this.ctx.body = {status: 'ok', currentAuthority: 'admin', account: userName};
    } else {
      return this.fail();
    }
  }
  async loginAction() {
    const { userName, password, type, autoLogin } = this.post();
    const logResult = await this.model('account').where({ username: userName, password }).find();
    if (!think.isEmpty(logResult)) {
      think.logger.info('****************成功登录****************');
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
        currentAuthority: 'admin' || role.name,
        type
      });
    } else {
      return this.success({
        status: 'error',
        currentAuthority: 'guest',
        type
      });
    }
  }
  async logoutAction() {
    const maxAge = -3600;
    await this.cookie('userName', null, { maxAge });
    await this.cookie('token', null, { maxAge });
    think.logger.info('****************成功退出****************');
    return this.success();
  }
}

Object.assign(Controller.prototype, actions);
module.exports = Controller;
