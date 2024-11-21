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

			const makes = await make.find();

			context.res = {
				status: 200,
				body: JSON.stringify(makes),
			};
			return context.res;
		} catch (error) {
			context.log.error(`Error fetching makes: ${error.message}`);
			context.res = {
				status: 500,
				body: `Error fetching makes: ${error.message}`,
				headers: {
					"Content-Type": "application/json"
				}
			};
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
			console.log("11111111111");
			context.res = {
				status: 400,
				body: "Invalid input. Provide a non-empty array of 'makes'."
			};
			return context.res;
		}

		const makes = bodyMakes.makes.map((value) => ({ make: value }));

		console.log(makes);

		await connectToDatabase();

		make.insertMany(makes);

		console.log("cccccccccccccccccccc");

		context.res = {
			status: 200,
			body: `Successfully added ${makes.length} makes.`,
			headers: {
				"Content-Type": "application/json"
			}
		};
		console.log("dddddddddddddddddddddd");

		return context.res;
	}
});
