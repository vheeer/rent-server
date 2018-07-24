module.exports = class extends think.Controller {
  __before() {
    console.log("***********************admin before***********************");
    const _this = this;
    const database = "rent";
    // 多商户
    this.model_1 = this.model;
    this.model = (function(model_com) {
      return function(name, model_spe, m) {
        return _this.model_1(name, model_spe || model_com, m);
      };
    }(database));
    // 设置头信息
    this.header('Access-Control-Allow-Headers', 'content-type');
    this.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8000');
    this.header('Access-Control-Allow-Headers', 'withcredentials');
    this.header('Access-Control-Allow-Credentials', 'true');
  }
};