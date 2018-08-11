const Base = require('./base.js');
const crypto = require('crypto');
const rp = require('request-promise');

module.exports = class extends Base {
  async loginAction() {
    const code = this.post('code');
    const fullUserInfo = this.post('userInfo');
    const userInfo = fullUserInfo.userInfo;

    const clientIp = ''; // 暂时不记录 ip
    const thistime = parseInt(new Date().getTime() / 1000); // 当前时间戳

    const { weapp: { appid, appSecret } } = this.config();

    // 获取openid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        js_code: code,
        secret: appSecret,
        appid
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.openid) {
      return this.fail('!openid登录失败');
    }

    // 验证用户信息完整性
    const sha1 = crypto.createHash('sha1').update(fullUserInfo.rawData + sessionData.session_key).digest('hex');
    if (fullUserInfo.signature !== sha1) {
      return this.fail('用户信息签名校验失败，登录失败');
    }

    // 解释用户数据
    const WeixinSerivce = this.service('weixin', { appSecret, appid });
    const weixinUserInfo = await WeixinSerivce.decryptUserInfoData(sessionData.session_key, fullUserInfo.encryptedData, fullUserInfo.iv);
    if (think.isEmpty(weixinUserInfo)) {
      return this.fail('解释用户数据失败，登录失败');
    }

    // 根据openid查找用户是否已经注册
    let userId = await this.model('custom').where({ openid: sessionData.openid }).getField('id', true);
    if (think.isEmpty(userId)) {
      // 注册
      userId = await this.model('custom').add({
        username: '微信用户' + think.uuid(6),
        register_ip: clientIp,
        last_login_time: thistime,
        last_login_ip: clientIp,
        openid: sessionData.openid,
        avatar: userInfo.avatarUrl || '',
        gender: userInfo.gender || 1, // 性别 0：未知、1：男、2：女
        nickname: userInfo.nickName,
        session_key: sessionData.session_key,
        add_time: thistime
      });
    }

    sessionData.user_id = userId;

    // 查询用户信息
    const newUserInfo = await this.model('custom').field(['id', 'username', 'nickname', 'mobile', 'gender', 'avatar', 'birthday', 'referee', 'is_distributor', 'code']).where({ id: userId }).find();

    // 更新登录信息
    userId = await this.model('custom').where({ id: userId }).update({
      last_login_time: parseInt(new Date().getTime() / 1000),
      last_login_ip: clientIp,
      session_key: sessionData.session_key
    });

    const TokenSerivce = this.service('token', 'api');
    const sessionKey = await TokenSerivce.create(sessionData);

    if (think.isEmpty(newUserInfo) || think.isEmpty(sessionKey)) {
      return this.fail('没有用户信息，登录失败');
    }

    return this.success({ token: sessionKey, userInfo: newUserInfo });
  }

  async logoutAction() {
    return this.success();
  }

  async getmobileAction() {
    const { weapp: { appid } } = this.config();
    const { userId } = this.ctx.state;
    const { encryptedData, iv } = this.post();

    if (think.isEmpty(encryptedData) || think.isEmpty(iv)) {
      return this.fail();
    }

    const { session_key: sessionKey, openid } = await this.model('custom').where({ id: userId }).find();

    const getMobileSerivce = this.service('getmobile', { appId: appid, sessionKey });
    const { purePhoneNumber } = getMobileSerivce.decryptData(encryptedData, iv);

    return this.success(purePhoneNumber);
  }
}