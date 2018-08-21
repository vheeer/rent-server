import fs from 'fs';
const Base = require('./base.js');
const Rest = require('./rest.js');

const namespace = 'custom';

const actions = Rest(namespace);

class Controller extends Base {
  async indexAction() {
    think.logger.info('api/shop/indexAction');
    const shops = await this.model('shop').select();
    return this.success(shops);
  }
  async idcardAction() {
    const { type } = this.get();
    // 图像上传至对象储存
    const { Bucket, SecretId, SecretKey } = this.config('cos');

    const save = this.service('savefile', SecretId, SecretKey, Bucket);
    const { err, url: idCardUrl } = await save.saveToCloud(this.file(), 'upload/idcard/');
    if (err) return this.fail('can not save this file to cloud');
    // 识别身份证内容
    const { appkey, appid } = this.config('ai');

    const bitmap = fs.readFileSync(this.file()['vheeer'].path);
    const base64 = Buffer.from(bitmap).toString('base64');

    const aiParams = {
      'app_id': appid,
      'time_stamp': parseInt(Date.now() / 1000),
      'nonce_str': think.uuid(32).replace(/-/g, ''),
      'image': base64,
      'card_type': type,
      'sign': ''
    };

    const AI = this.service('tencentai', aiParams, appkey);
    let result = await AI.idcard();
    result = JSON.parse(result);
    const { data } = result;
    // 存储结果
    let customData;
    if (type === '0') {
      customData = {
        real_name: data.name,
        gender: data.sex === '男' ? 1 : (data.name === '女' ? 2 : 0),
        nation: data.nation,
        birthday: parseInt(new Date(data.birth).getTime() / 1000),
        address: data.address,
        card_id: data.id,
        idcard_positive_img_url: idCardUrl
      };
    } else if (type === '1') {
      customData = {
        idcard_authority: data.authority,
        idcard_valid_date: data.valid_date,
        idcard_opposite_img_url: idCardUrl
      };
    }
    const updateResult = this.model('custom').where({ id: this.ctx.state.user_id }).update(customData);
    return this.success(updateResult);
  }
  async getuserinfoAction() {
    const result = await this.model('custom').getuserinfo(this.ctx.state.user_id);
    return this.success(result);
  }
}
Object.assign(Controller.prototype, actions);
module.exports = Controller;
