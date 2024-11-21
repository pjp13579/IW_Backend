const { app } = require('@azure/functions');
const { findMakeByName, findAllMakes } = require('./make');
const model = require('../models/model');
const connectToDatabase = require("../mongoConfig");
const { default: mongoose } = require('mongoose');

app.http('getmodel', {
	methods: ['GET'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {
			await connectToDatabase();

			const query = { archived: false };

			const { make } = request.params;

			if (make) {
				if (mongoose.Types.ObjectId.isValid(make)) {
					query.make = new mongoose.Types.ObjectId(make);
				} else {
					context.res = {
						status: 400,
						body: `Model id specified is invalid`,
					};
					return context.res;
				}
			}


			const models = JSON.stringify(await model.find(query).lean());

			context.res = {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
				body: models,
			};

			return context.res;
		} catch (error) {
			context.log.error(`Error fetching models: ${error.message}`);
			context.res = {
				status: 500,
				body: `Error fetching models: ${error.message}`,
			};
			return context.res;
		}
	}
});

app.http('postmodel', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);


		const body = await request.json();
		const makes = await findAllMakes();


		let modelsMongoose = [];

		for (const make of Object.keys(body)) { // Iterate over brands (e.g., "Ford")
			const models = body[make]; // Access each brand's models			

			const makeId = makes.find(value => value.make === make);
			console.log("makeId: " + makeId);

			for (const modelValue of models) { // Iterate over models (e.g., "Bronco", "LTD")
				modelsMongoose.push({
					make: makeId,
					model: modelValue,
					archived: false
				});
			}
		}
		console.log(modelsMongoose);

		model.insertMany(modelsMongoose);

		context.res = {
			status: 200,
			body: `Successfully added ${modelsMongoose.length} models.`,
			headers: {
				"Content-Type": "application/json"
			}
		};

		return context.res;
	}
});

async function findModelByName(name) {

	await connectToDatabase();

	return model.findOne({
		model: name,
		archived: false
	});
}

async function findAllModels() {
	await connectToDatabase();

	return model.find({ archived: false });
}


module.exports = {
	findModelByName,
	findAllModels
};