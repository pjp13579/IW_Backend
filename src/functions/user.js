const { app } = require('@azure/functions');
const mongoose = require('mongoose');
const userModel = require('../models/user');
const connectToDatabase = require("../mongoConfig");


/**
 * 
 * api prams
 * @param username account username
 * 
 * @param password account password
 */
app.http('userauth', {
	methods: ['post'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {
			await connectToDatabase();

			const { username, password } = await request.json();

			// validate input
			if (username === null || username === undefined || password === null || password === undefined) {
				context.res = {
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Credentials": true
					},
					body: JSON.stringify({ "Cause": "username/password not defined" })
				};
				return context.res;
			}

			const query = { "name": username, "password": password, archived: false };

			let user = await userModel.find(query).lean();

			// user not found or wrong password return
			if (!user) {
				context.res = {
					status: 204,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Credentials": true
					},
					body: JSON.stringify({ "Cause": "Request fields did not match to a user" })
				};

				return context.res;
			}

			let response = {};

			if (user) {
				response = { _id: user._id, name: user.name, "displayName": user.displayName };
			}

			context.res = {
				status: 206,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Credentials": true
				},
				body: JSON.stringify(response)
			};

			return context.res;
		} catch (error) {
			//context.log.error(`Error fetching models: ${error.message}`);
			context.res = {
				status: 500,
				body: `Error fetching models: ${error.message}`,
			};
			return context.res;
		}
	}
});

/**
 * 
 * api prams
 * @param username account username
 * 
 * @param password account password
 */
app.http('user', {
	methods: ['post'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {
			await connectToDatabase();

			//input
			const { username, password } = await request.json();

			// validate input exists
			if (username === null || username === undefined || password === null || password === undefined) {
				context.res = {
					status: 400,
					body: JSON.stringify({"Cause": "Auth data incomplete"})
				};
				return context.res;
			}

			//query
			const query = { "name": username, archived: false };

			let user = await userModel.findOne(query).lean();
			console.log(user);
			
			// username already registered
			if (user) {
				context.res = {
					status: 409,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Credentials": true
					},
					body: JSON.stringify({ cause: "Username already registered" })
				}

				return context.res;
			}

			user = { _id: new mongoose.Types.ObjectId(), "name": username, "password": password, "displayName": username, "archived": false }

			userModel.create(user);
			let response = {};

			context.res = {
				status: 206,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Credentials": true
				},
				body: JSON.stringify(response)
			};

			return context.res;
		} catch (error) {
			//context.log.error(`Error fetching models: ${error.message}`);
			context.res = {
				status: 500,
				body: `Error fetching models: ${error.message}`,
			};
			return context.res;
		}
	}
});