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
    // Optional filters and range params
    const { start, end } = req.query;

    const filter = {};
    if (start || end) {
      filter.dueDate = {};
      if (start) filter.dueDate.$gte = new Date(String(start));
      if (end) filter.dueDate.$lte = new Date(String(end));
    }

    // Find todos and sort by createdAt desc
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

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
    // Extract fields from the request body
    const { text, dueDate, recurrence } = req.body;

    // Validation: Check if text is provided
    // If not, return 400 status (bad request) with error message
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Create a new Todo instance with optional scheduling fields
    const todo = new Todo({
      text,
      dueDate: dueDate ? new Date(dueDate) : null,
      recurrence: recurrence || 'none'
    });

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
 * { text?: "Task description", completed?: true/false }
 *
 * PURPOSE: Partially update fields of a specific todo item in the database (e.g., text or completed status)
 *
 * URL PARAMETER:
 * :id - MongoDB ObjectId of the todo to update
 * Example: /api/todos/507f1f77bcf86cd799439011
 *
 * PROCESS:
 * 1. Extract todo ID from URL parameter
 * 2. Validate and update only the fields provided in the request body (text and/or completed)
 * 3. Check for errors (empty text, duplicate text, invalid completed value)
 * 4. Find and update the todo in one operation
 * 5. Check if todo was found
 * 6. Return updated todo or error message
 *
 * RESPONSE: Updated todo object or error
 * Example: { _id: "...", text: "New task", completed: true, ... }
 */
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const updateFields = {};
    // Validate and set text if present
    if ("text" in req.body) {
      const text = req.body.text;
      if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Text is required' });
      }
      // Check for duplicate text
      const duplicate = await Todo.findOne({
        text: { $regex: `^${text.trim()}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });
      if (duplicate) {
        return res.status(400).json({ message: 'Duplicate todo text' });
      }
      // Set text in the updatedFields
      updateFields.text = text.trim();
    }
    
    // Validate and set completed if present
    if ("completed" in req.body) {
      const completed = req.body.completed;

      // Validate if completed in undefined
      if (typeof completed === "undefined") {
        return res.status(400).json({ message: "Completed field is required" });
      }

      // VAlidate if completed is a boolean
      if (typeof completed !== "boolean") {
        return res.status(400).json({ message: "Completed must be a boolean" });
      }

      // Set completed and completedAt
      updateFields.completed = completed;
      updateFields.completedAt = completed ? new Date() : null;
    }

    // Optional updates for due date and recurrence
    if ("dueDate" in req.body) {
      updateFields.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }
    if ("recurrence" in req.body) {
      const allowed = ["none", "daily", "weekly", "monthly"];
      if (!allowed.includes(req.body.recurrence)) {
        return res.status(400).json({ message: "Invalid recurrence" });
      }
      updateFields.recurrence = req.body.recurrence;
    }
    
    // If no valid fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update the todo
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/analytics
 * Basic analytics metrics for the current tasks
 */
app.get('/api/analytics', async (req, res) => {
  try {
    const [total, completedCount, withDueDate] = await Promise.all([
      Todo.countDocuments({}),
      Todo.countDocuments({ completed: true }),
      Todo.find({ dueDate: { $ne: null } }, { createdAt: 1, completedAt: 1 }).lean()
    ]);

    // Average time to complete (ms)
    let durations = [];
    for (const t of withDueDate) {
      if (t.completedAt) {
        durations.push(new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime());
      }
    }
    const avgMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    // Simple daily completion streak (consecutive days with at least 1 completion)
    const recent = await Todo.find({ completedAt: { $ne: null } }, { completedAt: 1 }).sort({ completedAt: -1 }).lean();
    const days = new Set(recent.map(r => new Date(r.completedAt).toISOString().slice(0, 10)));
    let streak = 0;
    let cursor = new Date();
    for (;;) {
      const key = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate())).toISOString().slice(0, 10);
      if (days.has(key)) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      total,
      completed: completedCount,
      completionRate: total ? +(completedCount / total).toFixed(2) : 0,
      averageTimeToCompleteMs: avgMs,
      dailyCompletionStreak: streak
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/calendar
 * Query tasks by due date range
 * Query: start=ISO&end=ISO
 */
app.get('/api/calendar', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'start and end are required' });
    }
    const items = await Todo.find({
      dueDate: { $gte: new Date(String(start)), $lte: new Date(String(end)) }
    }).sort({ dueDate: 1 }).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/todos/export
 * Export todos as JSON or CSV
 */
app.get('/api/todos/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const todos = await Todo.find({}).sort({ createdAt: -1 }).lean();
    if (String(format).toLowerCase() === 'csv') {
      const headers = ['_id','text','completed','createdAt','completedAt','dueDate','recurrence'];
      const rows = [headers.join(',')].concat(
        todos.map(t => headers.map(h => {
          const v = t[h] instanceof Date ? new Date(t[h]).toISOString() : (t[h] ?? '');
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        }).join(','))
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="todos.csv"');
      return res.send(rows.join('\n'));
    }
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/todos/import
 * Import todos from JSON array [{text, completed, dueDate, recurrence}]
 */
app.post('/api/todos/import', async (req, res) => {
  try {
    const body = req.body;
    if (!Array.isArray(body)) {
      return res.status(400).json({ message: 'Expected an array of todos' });
    }
    const docs = body.map((t) => ({
      text: t.text,
      completed: !!t.completed,
      completedAt: t.completed ? (t.completedAt ? new Date(t.completedAt) : new Date()) : null,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      recurrence: t.recurrence && ["none","daily","weekly","monthly"].includes(t.recurrence) ? t.recurrence : 'none'
    })).filter(d => d.text && String(d.text).trim().length > 0);
    const created = await Todo.insertMany(docs, { ordered: false });
    res.status(201).json({ imported: created.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/todos/generate-recurring
 * Generate next occurrences for recurring tasks based on dueDate
 */
app.post('/api/todos/generate-recurring', async (req, res) => {
  try {
    const now = new Date();
    const recur = await Todo.find({ recurrence: { $ne: 'none' }, dueDate: { $ne: null } });
    let createdCount = 0;
    for (const t of recur) {
      const last = t.lastGeneratedAt ? new Date(t.lastGeneratedAt) : null;
      const due = new Date(t.dueDate);
      // If the current due date is past and the last generation is not today, create next occurrence
      const shouldGenerate = due.getTime() <= now.getTime() && (!last || last.toDateString() !== now.toDateString());
      if (!shouldGenerate) continue;

      // Calculate next due date
      const next = new Date(due);
      if (t.recurrence === 'daily') next.setDate(next.getDate() + 1);
      if (t.recurrence === 'weekly') next.setDate(next.getDate() + 7);
      if (t.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);

      await Todo.create({
        text: t.text,
        dueDate: next,
        recurrence: t.recurrence,
        completed: false,
        completedAt: null
      });

      t.lastGeneratedAt = now;
      await t.save();
      createdCount += 1;
    }
    res.json({ created: createdCount });
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
