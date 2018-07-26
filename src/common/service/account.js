const crypto = require('crypto');

const md5 = text => crypto.createHash('md5').update(text).digest('hex');

module.exports = class extends think.Service {
  
}
