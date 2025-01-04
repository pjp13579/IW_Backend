const { app } = require('@azure/functions');
const mongoose = require('mongoose');
const { findModelByName, findAllModels } = require('./model');
const submodel = require('../models/submodel');
const connectToDatabase = require("../mongoConfig");


/**
 * 
 * api prams
 * @param basic true: id and name; false array of _id
 * 
 * @param complete true: full collection; false: array of _id 
 * 
 * @param model filter by the specified model id
 */
app.http('getsubmodel', {
	methods: ['GET'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {
			await connectToDatabase();

			const { model, basic, complete } = request.params;	// if id is not specified, return every model

			const query = { archived: false };

			if (model) {
				if (mongoose.Types.ObjectId.isValid(model)) {
					query.model = new mongoose.Types.ObjectId(model);
				} else {
					context.res = {
						status: 400,
						body: `Model id specified is invalid`,
					};
					return context.res;
				}
			}

			let submodels = await submodel.find(query).lean();

			if (basic != null && typeof basic != 'undefined' && basic == "true") {
				submodels = submodels.map(item => ({ id: item._id, submodel: item.submodel }));
			} else if (complete == null || typeof complete == 'undefined' || complete != "true") {
				submodels = submodels.map(item => item._id);
			}

			if (!submodels) {
				context.res = { ...context.res, status: 204 };	// no content
			}
			else {
				context.res = { ...context.res, status: 200 };
			}

			context.res = {
				...context.res,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(submodels),
			};

			return context.res;
		} catch (error) {
			context.error(`Error fetching models: ${error.message}`);
			context.res = {
				status: 400
			};
			return context.res;
		}
	}
});

app.http('postsubmodel', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);


		const body = await request.json();
		const models = await findAllModels();

		let submodelsMongoose = [];

		for (const make of Object.keys(body)) { // Iterate over brands (e.g., "Ford")
			for (const model of Object.keys(body[make])) {

				const submodels = body[make][model]; // Access each brand's models			

				const modelId = models.find(value => value.model === model);

				for (const submodelValue of submodels) { // Iterate over models (e.g., "Bronco", "LTD")
					submodelsMongoose.push({
						model: modelId._id,
						submodel: submodelValue.model,
						archived: false,
						hybrid: submodelValue.hybrid
					});
				}
			}
		}
		//console.log(submodelsMongoose);
		//console.log("");

		submodel.insertMany(submodelsMongoose);

		context.res = {
			status: 201,
			body: `Successfully added ${submodelsMongoose.length} submodels.`,
			headers: {
				"Content-Type": "application/json"
			}
		};

		return context.res;
	}
});
