const mongoose = require("mongoose");

async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is missing. Add your MongoDB Atlas connection string to .env.");
  }

 try {
  const connection = await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
} catch (err) {
  console.error("FULL ERROR:");
  console.error(err);
  throw err;
}
}

module.exports = connectDatabase;
