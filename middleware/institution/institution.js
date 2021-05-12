const institutionModel = require('../../models/institution/institution');

module.exports = class institution {
	constructor() {}
	static async addinstitution(req, res) {
		let rb = req.body;
		let data = await institutionModel.findOne({ index: rb.index });
		if (await data) throw new Error('Institution Already Exist');
		let result = await institutionModel(rb);
		await result.save();
		res.status(200).json({
			message: 'Institution Successfully Created',
		});
		try {
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
	static async getinstitutions(req, res) {
		try {
			let data = await institutionModel.find().sort({ index: 1 });
			res.status(200).json({
				message: data,
			});
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
	static async deleteinstitution(req, res) {
		try {
			await institutionModel.findOneAndRemove({ _id: req.headers.id }).orFail(new Error('Unable to delete Doc'));
			res.status(200).json({
				message: 'Document Deleted Successfully',
			});
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
	static async addclass(req, res) {
		let rb = req.body;

		let data = await institutionModel.findOne({ _id: rb._id });
		if (await !data) throw new Error("Institution Doesn't exist");
		let result = await data.classes.find(item => {
			return item.index == rb.index;
		});
		if (await result) throw new Error('Class Already Exist');
		await data.classes.push({
			name: rb.name,
			index: rb.index,
		});
		await data.save();
		res.status(200).json({
			message: 'Class Successfully Created',
		});
		try {
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
	static async deleteclass(req, res) {
		try {
			let data = await institutionModel
				.findOne({ _id: req.headers.id })
				.orFail(new Error('Unable to delete Doc'));
			await data.classes.id(req.headers.classid).remove();
			await data.save();
			res.status(200).json({
				message: 'Document Deleted Successfully',
			});
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
};
