const { app } = require('@azure/functions');
const post = require('../models/post');
const connectToDatabase = require("../mongoConfig");
const { default: mongoose } = require('mongoose');
const { getMakeNameForId } = require('./make');
const { getModelNameForId } = require('./model');
const { getSubmodelNameForId } = require('./submodels');
const { getUserNameForId } = require('./user');

/**
 * 
 * optional request filter fields
 * 
 * @param make 
 * @param model 
 * @param submodel 
 * @param kilometersfrom 
 * @param kilometersto 
 * @param yearfrom 
 * @param yearto 
 * @param pricefrom 
 * @param priceto 
 * @param horsepowerfrom 
 * @param horsepowerto 
 * @param painteffect
 * @param painttreatment
 * @param paintfinish
 * @param paintcolor
 * @param carservicing
 * @param vatdeductible
 * @param financing
 * @param acceptsretake
 * @param secondarykey
 * @param fuel
 * @param powertrain
 * @param origincountry
 * @param thumbnailImage
 * @param images
 */
app.http('getpostfilter', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {

			await connectToDatabase();

			const body = await request.json();

			const { page, pagesize } = request.params;

			if (page == null || page == undefined || pagesize == null || pagesize == undefined) {
				context.error(`page or pagesize not found in url params`);
				context.res = {
					status: 400,
					body: "page or pagesize not found in url params",
				};
				return context.res;
			}


			let query = {};

			const queryOffset = (page - 1) * pagesize;	// Calculate offset value for pagination

			if (body.vehicleDetails == null || body.vehicleDetails == undefined) {
				query.archived = false;
			}
			else {
				query = await queryBuilder(body);
			}

			let posts = await post.find(query).skip(queryOffset).limit(pagesize).lean();

			let statusCode = 200;
			if (posts.length == 0) {
				statusCode = 204;	// no content for query
			}

			// total count for total pages calculation on the frontend
			const totalPosts = await post.countDocuments(query);
			const totalPages = Math.ceil(totalPosts / pagesize);

			// ------------------------------------- Format id fields -------------------------------------

			const dto = await processPosts(posts);


			// ------------------------------------- Response -------------------------------------
			context.res = {
				...context.res,	//  carry statuscode
				status: statusCode,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Credentials": true
				},
				body: JSON.stringify({ dto, totalPosts, totalPages, currentPage: parseInt(page), pagesize: parseInt(pagesize) }),
			};

			return context.res;
		} catch (error) {
			context.error(`Error fetching posts: ${error.message}`);
			context.res = {
				status: 400
			};
			return context.res;
		}
	}
});

async function processPosts(posts) {
	return Promise.all(
		posts.map(async (post) => {
			return {
				...post, // Spread existing post properties
				publisherUserName: await getUserNameForId(post.publisherUserId),
				vehicleDetails: {
					...post.vehicleDetails, // Spread existing vehicleDetails
					makeName: await getMakeNameForId(post.vehicleDetails.make),
					modelName: await getModelNameForId(post.vehicleDetails.model),
					submodelName: await getSubmodelNameForId(post.vehicleDetails.submodel),
				},
			};
		})
	);
};

async function queryBuilder(body) {
	const query = {};
	query.archived = false;
	if (body.vehicleDetails.make != null || body.vehicleDetails.make != undefined) {
		query["vehicleDetails.make"] = body.vehicleDetails.make;
	}
	if (body.vehicleDetails.model != null || body.vehicleDetails.model != undefined) {
		query["vehicleDetails.model"] = body.vehicleDetails.model;
	}
	if (body.vehicleDetails.submodel != null || body.vehicleDetails.submodel != undefined) {
		query["vehicleDetails.submodel"] = body.vehicleDetails.submodel;
	}
	if (body.vehicleDetails.kilometersfrom !== null && body.vehicleDetails.kilometersfrom !== undefined) {
		query["vehicleDetails.kilometers"] = {
			...query["vehicleDetails.kilometers"],
			$gte: body.vehicleDetails.kilometersfrom,
		}
	}
	if (body.vehicleDetails.kilometersto != null || body.vehicleDetails.kilometersto != undefined) {
		query["vehicleDetails.kilometers"] = {
			...query["vehicleDetails.kilometers"],
			$gle: body.vehicleDetails.kilometersto,
		}
	}
	if (body.vehicleDetails.yearfrom != null || body.vehicleDetails.yearfrom != undefined) {
		query["vehicleDetails.year"] = {
			...query["vehicleDetails.year"],
			$gte: body.vehicleDetails.yearfrom,
		}
	}
	if (body.vehicleDetails.yearto != null || body.vehicleDetails.yearto != undefined) {
		query["vehicleDetails.year"] = {
			...query["vehicleDetails.year"],
			$lte: body.vehicleDetails.yearto,
		}
	}
	if (body.vehicleDetails.pricefrom != null || body.vehicleDetails.pricefrom != undefined) {
		query["vehicleDetails.price"] = {
			...query["vehicleDetails.price"],
			$gte: body.vehicleDetails.pricefrom,
		}
	}
	if (body.vehicleDetails.priceto != null || body.vehicleDetails.priceto != undefined) {
		query["vehicleDetails.price"] = {
			...query["vehicleDetails.price"],
			$lte: body.vehicleDetails.priceto,
		}
	}
	if (body.vehicleDetails.horsepowerfrom != null || body.vehicleDetails.horsepowerfrom != undefined) {
		query["vehicleDetails.horsepower"] = {
			...query["vehicleDetails.horsepower"],
			$gte: body.vehicleDetails.horsepowerfrom,
		}
	}
	if (body.vehicleDetails.horsepowerto != null || body.vehicleDetails.horsepowerto != undefined) {
		query["vehicleDetails.horsepower"] = {
			...query["vehicleDetails.horsepower"],
			$lte: body.vehicleDetails.horsepowerto,
		}
	}
	if (body.vehicleDetails.painteffect != null || body.vehicleDetails.painteffect != undefined) {
		query["vehicleDetails.painteffect"] = body.vehicleDetails.painteffect;
	}
	if (body.vehicleDetails.painttreatment != null || body.vehicleDetails.painttreatment != undefined) {
		query["vehicleDetails.painttreatment"] = body.vehicleDetails.painttreatment;
	}
	if (body.vehicleDetails.paintfinish != null || body.vehicleDetails.paintfinish != undefined) {
		query["vehicleDetails.paintfinish"] = body.vehicleDetails.paintfinish;
	}
	if (body.vehicleDetails.paintcolor != null || body.vehicleDetails.paintcolor != undefined) {
		query["vehicleDetails.paintcolor"] = body.vehicleDetails.paintcolor;
	}
	if (body.vehicleDetails.carservicing != null || body.vehicleDetails.carservicing != undefined) {
		query["vehicleDetails.carservicing"] = body.vehicleDetails.carservicing;
	}
	if (body.vehicleDetails.vatdeductible != null || body.vehicleDetails.vatdeductible != undefined) {
		query["vehicleDetails.vatdeductible"] = body.vehicleDetails.vatdeductible;
	}
	if (body.vehicleDetails.financing != null || body.vehicleDetails.financing != undefined) {
		query["vehicleDetails.financing"] = body.vehicleDetails.financing;
	}
	if (body.vehicleDetails.acceptsretake != null || body.vehicleDetails.acceptsretake != undefined) {
		query["vehicleDetails.acceptsretake"] = body.vehicleDetails.acceptsretake;
	}
	if (body.vehicleDetails.secondarykey != null || body.vehicleDetails.secondarykey != undefined) {
		query["vehicleDetails.secondarykey"] = body.vehicleDetails.secondarykey;
	}
	if (body.vehicleDetails.fuel != null || body.vehicleDetails.fuel != undefined) {
		query["vehicleDetails.fuel"] = body.vehicleDetails.fuel;
	}
	if (body.vehicleDetails.powertrain != null || body.vehicleDetails.powertrain != undefined) {
		query["vehicleDetails.powertrain"] = body.vehicleDetails.powertrain;
	}
	if (body.vehicleDetails.origincountry != null || body.vehicleDetails.origincountry != undefined) {
		query["vehicleDetails.origincountry"] = body.vehicleDetails.origincountry;
	}
	return query;
}

app.http('createpost', {
	methods: ['post'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);
		try {

			await connectToDatabase();

			const body = await request.json();

			const vehicleDetails = Object.keys(post.schema.paths).filter(path => path.startsWith("vehicleDetails"));



			let missingFields = [];	// will contains the required fields that weren't present in the request body
			let newPost = {};

			// ------------------------------------- validate request body -------------------------------------
			// validate if user id was specified
			if (body['publisherUserId'] === null || body['publisherUserId'] === undefined) {
				context.error(`User token not detected`);
				context.res = {
					status: 400
				};
				return context.res;
			}
			else {
				newPost = {
					_id: new mongoose.Types.ObjectId(),
					"publishDate": new Date(),	// timestamp date
					"archived": false,		// show by default. Remove if needed
					"comments": [],			// initialize comments
					"publisherUserId": body['publisherUserId'],
					"vehicleDetails": {}
				}
			}

			// verify car properties
			for (const fieldName in vehicleDetails) {
				
				const field = vehicleDetails[fieldName].split(".")[1];
				if(field == "submodel" && (body.vehicleDetails[field] === null || body.vehicleDetails[field] === undefined)){
					newPost.vehicleDetails[field]
				}
				// validate if the field is present in the request body
				if (body.vehicleDetails[field] === null || body.vehicleDetails[field] === undefined) {
					missingFields.push(field);	// field is missing
				}
				else if (field == 'make' || field == 'model' || field == 'submodel') {	// handle moongose objectId fields
					newPost.vehicleDetails[field] = new mongoose.Types.ObjectId(body.vehicleDetails[field]);
				}
				else {
					newPost.vehicleDetails[field] = body.vehicleDetails[field];
				}

			}

			if (missingFields.length != 0) {	// handle invalid request			
				context.error(`Missing required car information: ${missingFields}`);
				context.res = {
					status: 400
				};
				return context.res;
			}

			post.create(newPost);

			// ------------------------------------- Response -------------------------------------
			context.res = {
				...context.res,	//  carry statuscode
				status: 201,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Credentials": true
				},
				body: JSON.stringify(newPost),
			};

			return context.res;
		} catch (error) {
			context.error(`Error: ${error.message}`);
			context.res = {
				status: 400
			};
			return context.res;
		}
	}
});