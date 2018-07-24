module.exports = function(modelName, columns) {
  return {
  /**
   * read request
   * @return {Promise}
   */
    async readAction() {
      think.logger.info('this.get is ', this.get());
      const { columns } = this.ctx.state;
      think.logger.info('columns', columns);

      const { id, key, value, page, pageSize, order } = this.get();
      let data;
      if (value && key) {
        // 按id查询
        data = await this.model(modelName).field(columns).where({ id }).countSelect();
      } else if (!id && !value && !key) {
        // 批量查询
        if (order) // 按字段排序
        {
          data = await this.model(modelName).field(columns).order(order).page(page, pageSize).countSelect();
        } else if (!order) // 默认排序
        {
          data = await this.model(modelName).field(columns).page(page, pageSize).countSelect();
        }
      }
      if (data.data.length > 0 && typeof data.data[0].user_id === 'number') // 如果存在user_id就提取出昵称和头像
      {
        for (const item of data.data) {
          const user = await this.model('user').field('nickname, avatar').where({ id: item.user_id }).find();
          item.nickname = user.nickname;
          item.avatar = user.avatar;
        }
      }
      return this.success(data);
    },
    /**
     * find request
     * @return {Promise}
     */
    async findAction() {
      const { columns } = this.ctx.state;
      const { id } = this.get();
      const data = await this.model(modelName).field(columns).where({ id }).countSelect();
      return this.success(data);
    },
    /**
   * create request
   * @return {Promise}
   */
    async createAction() {
    // return this.fail("can not create");
      const result = await this.model(modelName).add({
        ...this.post(),
        add_time: parseInt(new Date().getTime() / 1000)
      });

      return this.success(result);
    },

    /**
   * update request
   * @return {Promise}
   */
    async updateAction() {
      console.log('this.post is ', this.post());
      const postBody = this.post();
      const { id } = postBody;
      delete postBody.id;

      const data = await this.model(modelName).where({ id }).update(postBody);

      return this.success(data);
    },

    /**
   * delete request
   * @return {Promise}
   */
    async deleteAction() {
    // return this.fail("can not delete");
      const postBody = this.post();
      const { id } = postBody;

      if (!id) { return this.fail('id is undefined') }

      const data = await this.model(modelName).where({ id }).delete();

      return this.success(data);
    },
    async testAction() {
      const service = this.service('saveimg');
      console.log('new service.a', service.save);
      return this.success('result');
    },
    /**
   * image action
   * @return {Promise} []
   */
    async changeimgAction() {
      const { id, column } = this.get();
      // 储存
      const service = this.service('saveimg');
      const { save_path, url } = service.save(this.file());
      // 入库
      const updateObj = {};
      updateObj[column] = url;
      const result = await this.model(modelName).where({ id }).update(updateObj);

      return this.success(result);
    },
    /**
   * getcolumn action
   * @return {Promise} []
   */
    async readcolumnAction() {
      const model = this.model(modelName);
      const { tablePrefix } = model;
      const result = await model.query('desc ' + tablePrefix + modelName);
      return this.success(result);
    },
    /**
   * sortcolumn action
   * @return {Promise} []
   */
    async changecolumnAction() {
      const { id, column } = this.post();
      // 储存
      const service = this.service('saveimg');
      const { save_path, url } = service.save(this.file());
      // 入库
      const updateObj = {};
      updateObj[column] = url;
      const result = await this.model(modelName).where({ id }).update(updateObj);

      return this.success(result);
    }
  };
};
