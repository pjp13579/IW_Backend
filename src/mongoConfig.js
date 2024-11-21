const mongoose = require("mongoose");

let dbConnectionPromise = null; // Track connection promise

const connectToDatabase = async () => {
	if (mongoose.connection.readyState === 1) {
		console.info("=> Using existing database connection");
		return;
	}

	if (!dbConnectionPromise) {
		console.info("=> Connecting to database");
		const mongoUri = process.env.MONGO_URI; // Ensure this is properly set
		dbConnectionPromise = mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	}

	try {
		await dbConnectionPromise;
		console.info("Database connected");
	} catch (error) {
		console.error("Error connecting to the database:", error.message);
		dbConnectionPromise = null; // Reset promise on failure
		throw error;
	}
};

module.exports = connectToDatabase;
