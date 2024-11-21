const mongoose = require("mongoose");

const submodelSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	model: {
		type: mongoose.Schema.Types.ObjectId,
		require: true
	},
	submodel: {
		type: String,
		require: true,
	},
	archived: Boolean,
	hybrid: Boolean
});

const submodel = mongoose.model("submodels", submodelSchema);

module.exports = submodel;