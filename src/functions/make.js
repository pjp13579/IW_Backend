const { app } = require('@azure/functions');
const make = require('../models/make');
const connectToDatabase = require("../mongoConfig");

app.http('getmake', {
	methods: ['GET'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {
			await connectToDatabase();

			const makes = JSON.stringify(await make.find({ archived: false }).lean());

			context.res = {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
				body: makes,
			};

			return context.res;
		} catch (error) {
			context.log.error(`Error fetching makes: ${error.message}`);
			context.res = {
				status: 500,
				body: `Error fetching makes: ${error.message}`,
			};
			return context.res;
		}
	}
});

app.http('postmake', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);


		const bodyMakes = await request.json();

		// validate body
		if (!Array.isArray(bodyMakes.makes) || bodyMakes.makes.length === 0) {
			context.res = {
				status: 400,
				body: "Invalid input. Provide a non-empty array of 'makes'."
			};
			return context.res;
		}

		const makes = bodyMakes.makes.map((value) => ({
			make: value,
			archived: false
		}));

		console.log(makes);

		await connectToDatabase();

		make.insertMany(makes);

		context.res = {
			status: 200,
			body: `Successfully added ${makes.length} makes.`,
			headers: {
				"Content-Type": "application/json"
			}
		};

		return context.res;
	}
});

async function findMakeByName(name) {
	
	await connectToDatabase();
	
	return make.findOne({
		make: name,
		archived: false
	});
}

async function findAllMakes(){
	await connectToDatabase();

	return make.find({archived: false});
}


module.exports = {
	findMakeByName,
	findAllMakes
};