export default class extends think.Model {
  get relation() {
    return {
      role: {
        model: 'role',
        type: think.Model.BELONG_TO,
        field: 'id, name, name_cn'
      }
    };
  }
}
