export default class extends think.Model {
	async increase(column, num, where) {
		const row = await this.where(where).find();
		const value = row[column];
		const updateObj = {};
		updateObj[column] = parseInt(value) + parseInt(num);
		const updateRes = await this.where(where).update(updateObj);
		if (!think.isEmpty(updateRes)) {
			return true;
		}
	}
	async reduce(column, num, where) {
		const row = await this.where(where).find();
		const value = row[column];
		const updateObj = {};
		updateObj[column] = parseInt(value) - parseInt(num);
		const updateRes = await this.where(where).update(updateObj);
		if (!think.isEmpty(updateRes)) {
			return true;
		}
	}
}