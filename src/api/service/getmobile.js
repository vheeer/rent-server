const crypto = require('crypto');

module.exports = class extends think.Service {
  constructor(params) {
    super();
    Object.assign(this, params);
  }
  decryptData(encryptedData, iv) {
    think.logger.info('sessionKey', this.sessionKey);
    think.logger.info('encryptedData', encryptedData);
    think.logger.info('iv', iv);
    // base64 decode
    var sessionKey = new Buffer(this.sessionKey, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');

    try {
      // 解密
      var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      var decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Illegal Buffer1', err);
    }

    if (decoded.watermark.appid !== this.appId) {
      throw new Error('Illegal Buffer2', err);
    }

    return decoded;
  }
};
