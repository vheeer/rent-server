export default class extends think.Model {
  async getuserinfo(userId) {
    const newUserInfo = await this.field([
      'id',
      'username',
      'nickname',
      'mobile',
      'gender',
      'avatar',
      'birthday',
      'referee',
      'is_distributor',
      'code',
      'real_name',
      'idcard_authority',
      'idcard_valid_date',
      'nation',
      'birthday',
      'address',
      'card_id',
      'idcard_positive_img_url',
      'idcard_opposite_img_url',
      'position',
      'user_real_name',
      'balance',
      'deposit'
    ]).where({ id: userId }).find();
    return newUserInfo;
  }
}
