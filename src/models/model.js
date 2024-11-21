const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	make: {
		type: mongoose.Schema.Types.ObjectId,
		require: true
	},
	model: {
		type: String,
		require: true,
	},
	archived: Boolean
});

const model = mongoose.model("models", modelSchema);

module.exports = model;