export default class extends think.Model {
  get relation() {
    return {
      shop: {
        model: 'shop',
        type: think.Model.BELONG_TO,
        field: 'id, name'
      }
    };
  }
}
