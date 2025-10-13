/**
 * EXPRESS SERVER - Main Backend File
 *
 * This file sets up the Express server and defines all API routes
 * for the To-Do application. It handles communication between the
 * React frontend and MongoDB database.
 */

// Import required packages
import express from 'express';           // Web framework for Node.js
import cors from 'cors';                 // Enables Cross-Origin Resource Sharing
import dotenv from 'dotenv';             // Loads environment variables from .env file
import connectDB from './config/db.js';  // MongoDB connection function
import Todo from './models/Todo.js';     // Todo database model

// Load environment variables from .env file into process.env
// This allows us to access sensitive data like database URLs securely
dotenv.config();

// Initialize Express application
// This creates an instance of an Express app that we can configure
const app = express();

// Connect to MongoDB database
// This function is called immediately when the server starts
// It establishes connection to MongoDB Atlas (cloud database)
connectDB();

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================
// Middleware are functions that process requests before they reach routes

// Enable CORS - allows our React frontend (port 3000) to communicate with
// this backend server (port 5000). Without this, browsers block the requests
app.use(cors());

// Parse incoming JSON data in request body
// This allows us to access req.body.text when frontend sends JSON data
app.use(express.json());

// ========================================
// API ROUTES
// ========================================
// These routes define the endpoints that the frontend can call

/**
 * GET /api/todos
 *
 * PURPOSE: Fetch all todo items from the database
 *
 * PROCESS:
 * 1. Query MongoDB to find all todos
 * 2. Sort them by creation date (newest first)
 * 3. Return the list as JSON
 *
 * RESPONSE: Array of todo objects
 * Example: [{ _id: "123", text: "Buy milk", createdAt: "2024-01-01" }]
 */
app.get('/api/todos', async (req, res) => {
  try {
    // Find all todos in database and sort by createdAt in descending order (-1)
    // This means newest todos appear first in the list
    const todos = await Todo.find().sort({ createdAt: -1 });

    // Send the todos array as JSON response with 200 status (success)
    res.json(todos);
  } catch (error) {
    // If database query fails, send error message with 500 status (server error)
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/todos
 *
 * PURPOSE: Create a new todo item in the database
 *
 * EXPECTED REQUEST BODY:
 * { text: "Task description" }
 *
 * PROCESS:
 * 1. Extract text from request body
 * 2. Validate that text is provided
 * 3. Create new Todo document
 * 4. Save to database
 * 5. Return the created todo
 *
 * RESPONSE: Newly created todo object
 * Example: { _id: "124", text: "New task", createdAt: "2024-01-01" }
 */
app.post('/api/todos', async (req, res) => {
  try {
    // Extract the text field from the request body
    // Request body is automatically parsed by express.json() middleware
    const { text } = req.body;

    // Validation: Check if text is provided
    // If not, return 400 status (bad request) with error message
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Create a new Todo instance with the provided text
    // MongoDB will automatically generate _id and add createdAt timestamp
    const todo = new Todo({ text });

    // Save the new todo to MongoDB database
    // This is an async operation that waits for database confirmation
    const newTodo = await todo.save();

    // Send the newly created todo back with 201 status (created successfully)
    res.status(201).json(newTodo);
  } catch (error) {
    // If validation or save fails, send error with 400 status (bad request)
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/todos/:id
 *
 * PURPOSE: Delete a specific todo item from the database
 *
 * URL PARAMETER:
 * :id - MongoDB ObjectId of the todo to delete
 * Example: /api/todos/507f1f77bcf86cd799439011
 *
 * PROCESS:
 * 1. Extract todo ID from URL parameter
 * 2. Find and delete the todo in one operation
 * 3. Check if todo was found
 * 4. Return success message
 *
 * RESPONSE: Success message or error
 * Example: { message: "Todo deleted successfully" }
 */
app.delete('/api/todos/:id', async (req, res) => {
  try {
    // req.params.id contains the ID from the URL path
    // findByIdAndDelete() finds the document by ID and deletes it in one operation
    const todo = await Todo.findByIdAndDelete(req.params.id);

    // If no todo was found with that ID, return 404 status (not found)
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // If deletion was successful, send confirmation message
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    // If deletion fails (e.g., invalid ID format), send error with 500 status
    res.status(500).json({ message: error.message });
  }
});

/**
 * PATCH /api/todos/:id
 * 
 * EXPECTED REQUEST BODY:
 * { text: "Task description" }
 *
 * PURPOSE: Update a specific todo item in the database
 *
 * URL PARAMETER:
 * :id - MongoDB ObjectId of the todo to delete
 * Example: /api/todos/507f1f77bcf86cd799439011
 *
 * PROCESS:
 * 1. Extract todo ID from URL parameter
 * 2. Find and update the todo in one operation
 * 3. Check if todo was found
 * 4. Return success message
 *
 * RESPONSE: Success message or error
 * Example: { message: "Todo deleted successfully" }
 */
app.patch('/api/todos/:id', async (req, res) => {
  try {
    // Extract the text field from the request body
    const { text } = req.body;

    // Validate: text must not be empty or just whitespace
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Validate: text must not be a duplicate of another todo (case-insensitive)
    const duplicate = await Todo.findOne({
      text: { $regex: `^${text.trim()}$`, $options: 'i' },
      _id: { $ne: req.params.id }
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Duplicate todo text' });
    }

    // Update the todo's text
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text: text.trim() },
      { new: true }
    );

    // If no todo was found with that ID, return 404 status (not found)
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // If update was successful, send updated todo
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// START SERVER
// ========================================

// Get the port number from environment variable or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start the Express server and listen for incoming requests
// The callback function runs once the server successfully starts
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/todos`);
});
