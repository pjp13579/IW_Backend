const mongoose = require("mongoose");

const makeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	make: {
		type: String,
		require: true,
	}
});

const make = mongoose.model("makes", makeSchema);

module.exports = make;