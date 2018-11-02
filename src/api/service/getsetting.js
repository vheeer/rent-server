import fs from 'fs'
import path from 'path'

const xml2js = require('xml2js');
const xml2jsP = xml => new Promise((resolve, reject) => {
  xml2js.parseString(xml, (err, result) => {
    if (err) {
      reject(err);
    }
    resolve(result);
  });
})

const settingPath = path.join(__dirname, '../../../setting/config.xml');

export default class extends think.Service {
  async getobj() {
    const configXML = fs.readFileSync(settingPath, 'utf-8');
	const data = await xml2jsP(configXML)

    return data.root;
  }
}
