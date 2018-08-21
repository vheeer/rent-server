const fs = require('fs');
const COS = require('cos-nodejs-sdk-v5');

module.exports = class extends think.Service {
  constructor(SecretId, SecretKey, Bucket) {
    super();
    // 创建实例
    this.cos = new COS({
      SecretId,
      SecretKey
    });
    this.Bucket = Bucket;
  }
  // 上传单个文件
  uploadP(bucket, path, savePath) {
    return new Promise((resolve, reject) => {
      // think.logger.debug('分片上传bucket, path, save_path', bucket, path, savePath);
      // 分片上传
      this.cos.sliceUploadFile({
        Bucket: bucket,
        Region: 'ap-beijing',
        Key: savePath,
        FilePath: path
      }, function(err, data) {
        // think.logger.debug('分片上传err, data', { err, data });
        if (err) { reject(err) }
        resolve({ err, data });
      });
    });
  }
  save(imageFile) {
    // 获取文件对象
    let file = null;
    for (const key in imageFile) {
      file = imageFile[key];
      break;
    }
    if (think.isEmpty(file)) {
      return this.fail('保存失败');
    }
    const { name, path } = file;
    const typeArr = name.split('.');
    const type = typeArr[typeArr.length - 1];
    // 保存路径
    const randValue = think.uuid(32);
    const savePath = think.ROOT_PATH + '/www/static/upload/images/' + randValue + '.' + type;
    const url = think.config('file_path') + '/upload/images/' + randValue + '.' + type;
    think.logger.debug('savePath ', savePath);
    think.logger.debug('url ', url);
    // 存储文件
    const is = fs.createReadStream(path);
    const os = fs.createWriteStream(savePath);
    is.pipe(os);
    // 返回保存路径
    return { savePath, url };
  }
  async saveToCloud(imageFile, saveDir) {
    // 获取文件对象
    let file = null;
    for (const key in imageFile) {
      file = imageFile[key];
      break;
    }
    if (think.isEmpty(file)) {
      return this.fail('保存失败');
    }
    const { name, path } = file;
    const typeArr = name.split('.');
    const type = typeArr[typeArr.length - 1];
    // think.logger.debug('{ name, path }', { name, path });
    // 保存路径
    const randValue = think.uuid(32);
    const savePath = '/' + saveDir + randValue + '.' + type;
    const { err, data } = await this.uploadP(this.Bucket, path, savePath);
    // think.logger.debug('分片上传返回结果', data);
    if (err) { return { err } }
    // 返回保存路径
    let { Location: url } = data;
    url = 'https://' + url;
    return { url };
  }
};
