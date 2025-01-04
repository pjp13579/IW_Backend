const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
	},
	displayName: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		require: true,
	},	
	archived: Boolean
});

const user = mongoose.model("users", userSchema);

module.exports = user;