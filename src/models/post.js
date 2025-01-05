const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	publisherUserId: mongoose.Schema.Types.ObjectId,
	publishDate: {
		type: Date,
		required: true,
	},
	vehicleDetails: {
		make: {
			type: mongoose.Schema.Types.ObjectId,
			require: true
		},
		model: {
			type: mongoose.Schema.Types.ObjectId,
			require: true
		},
		submodel: {
			type: mongoose.Schema.Types.ObjectId,
			require: false
		},
		kilometers: {
			type: Number,
			require: true,
		},
		year: {
			type: Number,
			require: true,
		},
		price: {
			type: Number,
			require: true,
		},
		horsepower: {
			type: Number,
			require: true,
		},
		painteffect: {
			type: String,
			require: true,
		},
		painttreatment: {
			type: String,
			require: true,
		},
		paintfinish: {
			type: String,
			require: true,
		},
		paintcolor: {
			type: String,
			require: true,
		},
		carservicing: {
			type: String,
			require: true,
		},
		vatdeductible: {
			type: String,
			require: true,
		},
		financing: {
			type: String,
			require: true,
		},
		acceptsretake: {
			type: String,
			require: true,
		},
		secondarykey: {
			type: String,
			require: true,
		},
		fuel: {
			type: String,
			require: true,
		},
		powertrain: {
			type: String,
			require: true,
		},
		origincountry: {
			type: String,
			require: true,
		},
		thumbnailImage: {
			type: String,
			require: true,
		}
		,
		images: {
			type: mongoose.Schema.Types.Array,
			require: true,
		}
	},
	archived: Boolean,
	comments: mongoose.Schema.Types.Array,
});

const post = mongoose.model("posts", postSchema);

module.exports = post;

