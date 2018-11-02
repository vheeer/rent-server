import Base from './base';
const fields = {
  'id': '',
  'username': '',
  'nickname': '',
  'mobile': '',
  'gender': '',
  'avatar': '',
  'referee': '',
  'is_distributor': '',
  'code': '',
  'real_name': '未检测到身份证姓名信息，请重新上传身份证正面',
  'idcard_authority': '未检测到身份证签发机关，请重新上传身份证反面',
  'idcard_valid_date': '未检测到身份证有效期限，请重新上传身份证反面',
  'nation': '未检测到身份证民族信息，请重新上传身份证正面',
  'birthday': '未检测到身份证出生日期信息，请重新上传身份证正面',
  'address': '未检测到身份证住址信息，请重新上传身份证正面',
  'card_id': '未检测到身份证号码，请重新上传身份证正面',
  'idcard_positive_img_url': '未检测到身份证件（正面），请上传',
  'idcard_opposite_img_url': '未检测到身份证件（反面），请上传',
  'position': '未填写使用地点，请完善信息',
  'user_real_name': '未填写使用者姓名，请完善信息',
  'balance': '',
  'deposit': '',
  'is_paid': ''
};
export default class extends Base {
  async getuserinfo(userId) {
    return this.field(Object.keys(fields)).where({ id: userId }).find();
  }
  // 用户信息完整性校验
  async check(userId) {
    const userInfo = await this.field(Object.keys(fields)).where({ id: userId }).find();
    let checkMes = null;
    Object.keys(userInfo).forEach(key => {
      if (fields[key] !== '' && (!userInfo[key] || !userInfo[key] === '' || !userInfo[key] === 0)) {
        checkMes = fields[key];
      }
    });
    return { checkMes, userInfo };
  }
}
