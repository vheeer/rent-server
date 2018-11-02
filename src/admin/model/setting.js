import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const settingPath = path.join(__dirname, '../../../setting/config.xml');

export default class extends think.Model {
  getobj() {
    const configXML = fs.readFileSync(settingPath, 'utf-8');
    const $ = cheerio.load(configXML);
    
    console.log('$', $)
    return $;
  }
}
