const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {
		type: String,
		require: true,
	},
	displayName: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},	
	archived: Boolean
});

const user = mongoose.model("users", userSchema);

module.exports = user;