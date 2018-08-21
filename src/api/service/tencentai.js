const crypto = require('crypto');
const rp = require('request-promise');
const urlencode = require('urlencode');

const md5 = text => crypto.createHash('md5').update(text).digest('hex');

module.exports = class extends think.Service {
  constructor(params, appkey) {
    super();
    this.params = params;

    // 对象按字典序正序重新组合
    const sortParams = {};

    Object.keys(params).sort().forEach(key => {
      sortParams[key] = params[key];
    });
    // 生成参数字符串
    let str = '';

    Object.keys(sortParams).forEach(key => {
      if (sortParams[key] !== '') {
        str += key + '=' + urlencode(sortParams[key]) + '&';
      }
    });
    str += 'app_key=' + appkey;
    // 生成签名
    const sign = (md5(str)).toUpperCase();
    this.params.sign = sign;
  }
  async idcard() {
    const options = {
      method: 'POST',
      url: 'https://api.ai.qq.com/fcgi-bin/ocr/ocr_idcardocr',
      form: this.params
    };
    const startTime = Date.now();
    think.logger.debug('开始识别身份证时间： ', startTime);
    const result = await rp(options);
    const endTime = Date.now();
    think.logger.debug('身份证识别完成时间： ', endTime);
    think.logger.debug('用时', (endTime - startTime) / 1000);
    think.logger.debug('身份证识别结果： ', result);
    return result;
  }
};
