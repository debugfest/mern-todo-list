/**
 * DATABASE CONNECTION - MongoDB Configuration
 *
 * This file handles the connection to MongoDB database using Mongoose.
 * Mongoose is an ODM (Object Data Modeling) library that provides a
 * structured way to interact with MongoDB.
 */

import mongoose from 'mongoose';

/**
 * connectDB Function
 *
 * PURPOSE: Establish connection to MongoDB Atlas (cloud database)
 *
 * HOW IT WORKS:
 * 1. Reads the database URL from environment variables (.env file)
 * 2. Uses Mongoose to connect to MongoDB
 * 3. If successful, logs the database host name
 * 4. If fails, logs error and terminates the application
 *
 * ENVIRONMENT VARIABLE REQUIRED:
 * MONGODB_URI - Connection string from MongoDB Atlas
 * Format: mongodb+srv://username:password@cluster.mongodb.net/database
 *
 * WHEN THIS RUNS:
 * Called immediately when server.js starts, before any routes are defined
 */
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    // Safety check: exit if URI is undefined
    if (!MONGODB_URI) {
      console.error("Error: MONGODB_URI is not defined in .env");
      process.exit(1);
    }

    // Attempt to connect to MongoDB using the connection string
    const conn = await mongoose.connect(MONGODB_URI);

    // If connection succeeds, log the database host for confirmation
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails (wrong password, network issue, etc.)
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Export the function so it can be imported and used in server.js
export default connectDB;
