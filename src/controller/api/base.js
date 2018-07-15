module.exports = class extends think.Controller {
  __before() {
    console.log('***********************api before***********************');
    const _this = this;
    const database = "rent";
    // 多商户
    this.model_1 = this.model;
    this.model = (function(model_com) {
      return function(name, model_spe, m) {
        return _this.model_1(name, model_spe || model_com, m);
      };
    }(database));
  }
};
