const roleModel = require('../../models/role/role');

module.exports = class role {
	constructor() {}
	static async addrole(req, res) {
		try {
            let rb = req.body.name.toLowerCase();
            let data = await roleModel.findOne({ name: rb });
            if(data) throw new Error('Role Already Exist');
            console.log(data);
        let d = roleModel({name: rb});
        d.save();
        	res.status(200).json({
        		message: 'Role Added successfully',
        	});
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}
	static async getroles(req, res) {
		try {
            let data = await roleModel.find().select('-_id name');
        	res.status(200).json({
        		message: data,
        	});
		} catch (error) {
			res.status(400).json({
				error: error,
			});
		}
	}

};
