const mongoose = require('mongoose');

const institutionSchema = mongoose.Schema({
	name: { type: String, required: true, uppercase: true },
	index: { type: Number, required: true },
	classes: [
		{
			name: { type: String, required: true, uppercase: true },
			index: { type: Number, required: true },
		},
	],
});

module.exports = mongoose.model('institutionModel', institutionSchema);
