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
      return this.success(data);
    },
    /**
     * 根据字段键值搜索
     * select request
     * @return {Promise}
     */
    async selectAction() {
      let params = this.get();
      const { _page, _pageSize, _sort, _limit, ..._where } = params;
      if (think.isEmpty(params)) {
        // 兼容where无参数情况
        params = 1;
      }

      const data = await this.model(modelName).field(columns).where(_where).limit(_limit).order(_sort).page(_page, _pageSize).countSelect();
      return this.success(data);
    },
    /**
     * 根据字段键值搜索
     * find request
     * @return {Promise}
     */
    async matchAction() {
      let params = this.get();
      const { _page, _pageSize, _sort, _limit, ..._where } = params;
      if (think.isEmpty(params)) {
        // 兼容where无参数情况
        params = 1;
      }

      let whereStr = '';
      Object.keys(_where).forEach(key => {
        const value = _where[key];
        if (typeof value === 'undefined' || value === '') {
          return;
        }
        if (key.indexOf('_time') > -1) {
          const timestamp = _where[key] / 1000;
          whereStr += `DATE_FORMAT(FROM_UNIXTIME(${key}),'%Y-%m-%d') = DATE_FORMAT(FROM_UNIXTIME(${timestamp}),'%Y-%m-%d') and `;
        } else if (key.indexOf('is_') > -1) {
          whereStr += key + '=' + _where[key] + ' and ';
        } else {
          whereStr += key + ' like ' + '\'%' + _where[key] + '%\' and ';
        }
      });
      whereStr = whereStr.substr(0, whereStr.length - 5);
      const data = await this.model(modelName).field(columns).where(whereStr).limit(_limit).order(_sort).page(_page, _pageSize).countSelect();
      return this.success(data);
    },

    /**
     * create request
     * @return {Promise}
     */
    async createAction() {
      think.logger.debug(this.post());
      let { id, ...params } = this.post();
      if (!id) {
        id = -1;
      }
      const singleData = {
        ...params,
        add_time: parseInt(new Date().getTime() / 1000)
      };
      const result = await this.model(modelName).thenUpdate(singleData, { id });

      return this.success(result);
    },
    /**
     * createmul request
     * @return {Promise}
     */
    async createmulAction() {
      think.logger.debug(this.post());
      const { _count, ...params } = this.post();
      // 批量
      const singleData = {
        ...params,
        add_time: parseInt(new Date().getTime() / 1000)
      };
      const data = [];
      for (let i = 0; i < parseInt(_count); i++) {
        data.push(singleData);
      }
      const result = await this.model(modelName).addMany(data);
      return this.success(result);
    },

    /**
     * update request
     * @return {Promise}
     */
    async updateAction() {
      const { id, _ids, ...updateBody } = this.post();

      let result;

      if (id && !_ids) {
        result = await this.model(modelName).where({ id }).update(updateBody);
      } else if (!id && _ids) {
        result = await this.model(modelName).where('id in (' + _ids + ')').update(updateBody);
      } else if (!id && !_ids) {
        return this.fail('delete requires id(s)');
      } else {
        return this.fail('can not update id');
      }

      return this.success(result);
    },

    /**
     * delete request
     * @return {Promise}
     */
    async deleteAction() {
      const { id, _ids } = this.post();
      console.log('id in (' + _ids + ')');
      let result;

      if (id && !_ids) {
        result = await this.model(modelName).where({ id }).delete();
      } else if (!id && _ids) {
        result = await this.model(modelName).where('id in (' + _ids + ')').delete();
      } else if (!id && !_ids) {
        return this.fail('delete requires id(s)');
      } else {
        return this.fail('can not set params both id and ids');
      }

      return this.success(result);
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
