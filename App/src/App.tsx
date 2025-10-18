/**
 * MAIN APP COMPONENT - React Frontend
 *
 * This is the main React component that handles the entire To-Do app UI.
 * It manages state, communicates with the backend API, and renders the interface.
 *
 * KEY CONCEPTS FOR BEGINNERS:
 * - State: Data that can change and trigger re-renders when updated
 * - Hooks: Special React functions that let you use state and lifecycle features
 * - API Calls: HTTP requests to communicate with the backend server
 * - Props: Data passed to components (used in child elements like buttons)
 */

import { useState, useEffect } from "react"; // React hooks for state and side effects
import axios from "axios"; // HTTP client for making API requests
import { Plus } from "lucide-react"; // Icon components for UI
import TodoItem from "./components/TodoItem"; // Child component for individual todo items

/**
 * TYPESCRIPT INTERFACE
 *
 * Defines the structure of a Todo object to ensure type safety.
 * This helps catch errors during development by enforcing the shape of data.
 *
 * PROPERTIES:
 * - _id: Unique identifier from MongoDB (the underscore is MongoDB convention)
 * - text: The task description
 * - createdAt: ISO timestamp string when todo was created
 */
export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

/**
 * APP COMPONENT
 *
 * The main functional component that renders the entire application.
 * Manages all state, handles user interactions, and communicates with backend.
 */
function App() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  // State is data that React watches for changes. When state updates,
  // React automatically re-renders the component with the new data.

  /**
   * todos: Array holding all todo items fetched from database
   * setTodos: Function to update the todos array
   * Initial value: Empty array []
   *
   * Example: [{ _id: "123", text: "Buy milk", createdAt: "..." }]
   */
  const [todos, setTodos] = useState<Todo[]>([]);

  /**
   * inputText: Current value of the input field where user types new todos
   * setInputText: Function to update inputText
   * Initial value: Empty string ''
   *
   * This creates a "controlled input" - React controls the input's value
   */
  const [inputText, setInputText] = useState("");

  /**
   * loading: Boolean flag to track if an API request is in progress
   * setLoading: Function to update loading state
   * Initial value: false
   *
   * Used to disable buttons and show loading states during operations
   */
  const [loading, setLoading] = useState(false);

  /**
   * isCompleted: Boolean flag to track if a todo is completed
   * setIsCompleted: Function to update isCompleted state
   * Initial value: false
   *
   * Used to visually indicate completed tasks
   */
  const [isCompleted, setIsCompleted] = useState(false);

  // ========================================
  // API CONFIGURATION
  // ========================================

  /**
   * Backend API URL
   * This is where our Express server is running and listening for requests
   */
  const API_URL = "http://localhost:5000/api/todos";

  // ========================================
  // SIDE EFFECTS (useEffect)
  // ========================================

  /**
   * useEffect Hook - Runs code after component renders
   *
   * This effect runs ONCE when the component first mounts (appears on screen)
   * because the dependency array [] is empty.
   *
   * PURPOSE: Fetch all existing todos from database when app loads
   */
  useEffect(() => {
    fetchTodos();
  }, []); // Empty array means "only run once on mount"

  // ========================================
  // API FUNCTIONS
  // ========================================

  /**
   * fetchTodos - GET Request
   *
   * PURPOSE: Retrieve all todos from the backend database
   *
   * PROCESS:
   * 1. Send GET request to backend API
   * 2. Wait for response containing array of todos
   * 3. Update state with the received todos
   * 4. If error occurs, log it to console
   *
   * WHEN CALLED: On initial page load, and after operations that might affect the list
   */
  const fetchTodos = async () => {
    try {
      // axios.get() sends HTTP GET request to fetch data
      // 'await' pauses execution until response arrives
      const response = await axios.get(API_URL);

      // response.data contains the array of todos from backend
      // Update state with the new todos (this triggers re-render)
      setTodos(response.data);
    } catch (error) {
      // If request fails (network error, server down, etc.), log the error
      console.error("Error fetching todos:", error);
    }
  };

  /**
   * addTodo - POST Request
   *
   * PURPOSE: Create a new todo and save it to the database
   *
   * PROCESS:
   * 1. Validate that input is not empty
   * 2. Set loading state to disable button
   * 3. Send POST request with todo text to backend
   * 4. Add the new todo to the front of the todos array
   * 5. Clear the input field
   * 6. Reset loading state
   *
   * CALLED WHEN: User clicks "Add Task" button or presses Enter
   */
  const addTodo = async () => {
    // Validation: Check if input has actual text (not just whitespace)
    // If empty, exit function early without making API call
    if (!inputText.trim()) return;

    // Set loading to true - disables the add button during request
    setLoading(true);

    try {
      // Send POST request with the todo text in request body
      // Backend expects: { text: "task description" }
      const response = await axios.post(API_URL, { text: inputText });

      // response.data contains the newly created todo with _id from database
      // Add new todo to START of array using spread operator [newTodo, ...oldTodos]
      // This makes newest todos appear at the top
      setTodos([response.data, ...todos]);

      // Clear the input field after successful creation
      setInputText("");
    } catch (error) {
      // If request fails, log the error
      console.error("Error adding todo:", error);
    } finally {
      // 'finally' always runs whether try succeeds or fails
      // Reset loading state to re-enable the button
      setLoading(false);
    }
  };

  /**
   * deleteTodo - DELETE Request
   *
   * PURPOSE: Remove a specific todo from the database
   *
   * PROCESS:
   * 1. Send DELETE request to backend with todo ID
   * 2. If successful, remove todo from local state array
   * 3. React automatically re-renders with updated list
   *
   * PARAMETERS:
   * @param id - MongoDB ObjectId of the todo to delete
   *
   * CALLED WHEN: User clicks the trash icon button next to a todo
   */
  const deleteTodo = async (id: string) => {
    try {
      // Send DELETE request to backend with specific todo ID in URL
      // Example URL: http://localhost:5000/api/todos/507f1f77bcf86cd799439011
      await axios.delete(`${API_URL}/${id}`);

      // Filter out the deleted todo from state array
      // filter() creates new array with todos that DON'T match the deleted id
      // This updates UI immediately without waiting for backend confirmation
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      // If deletion fails, log the error
      console.error("Error deleting todo:", error);
    }
  };

  /**
   * editTodo - PATCH Request
   *
   * PURPOSE: Update a specific todo in the database
   *
   * PROCESS:
   * 1. Send PATCH request to backend with todo ID
   * 2. If successful, update todo in local state array
   * 3. React automatically re-renders with updated list
   *
   * PARAMETERS:
   * @param id - MongoDB ObjectId of the todo to edit
   * @param text - Updated text for the todo
   *
   * CALLED WHEN: User clicks the edit icon button next to a todo
   */
  const editTodo = async (id: string, text?: string, completed?: boolean) => {
    try {
      // Send PATCH request to backend with specific todo ID in URL and updated text and/or completed status
      // Example URL: http://localhost:5000/api/todos/507f1f77bcf86cd799439011
      // Example body for text: { text: "Updated task description" }
      // Example body for completed: { completed: true }

      if (text !== undefined && text !== null && text.trim() !== "") {
        await axios.patch(`${API_URL}/${id}`, { text });

        // Map through todos and update text of the one that matches the edited id
        setTodos(
          todos.map((todo) => (todo._id === id ? { ...todo, text } : todo))
        );
      } else if (completed !== undefined && completed !== null) {
        await axios.patch(`${API_URL}/${id}`, { completed });

        // Map through todos and update completed status of the one that matches the edited id
        setTodos(
          todos.map((todo) => (todo._id === id ? { ...todo, completed } : todo))
        );
      }

      // Return null to indicate success (no error)
      return null;
    } catch (error) {
      // If update fails, show error message
      let message = "An error occurred while editing the todo";

      // Check if error is an Axios error with a response message
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }

      // Return the error message to the caller
      return message;
    }
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * handleKeyPress - Keyboard Event Handler
   *
   * PURPOSE: Allow users to add todos by pressing Enter key
   *
   * PROCESS:
   * 1. Check if the pressed key is Enter
   * 2. If yes, trigger the addTodo function
   *
   * PARAMETERS:
   * @param e - React keyboard event object containing key information
   *
   * UX IMPROVEMENT: Users can add tasks without clicking the button
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Check if the key pressed was Enter
    if (e.key === "Enter") {
      addTodo(); // Same function as clicking "Add Task" button
    }
  };

  // ========================================
  // JSX RENDER - UI STRUCTURE
  // ========================================
  // Everything below is the UI that gets displayed to users
  // JSX looks like HTML but is actually JavaScript

  return (
    // Main container: Full screen height with gradient background
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-3">
      {/* Content wrapper: Max width container, centered */}
      <div className="max-w-2xl mx-auto">
        {/* ========== HEADER SECTION ========== */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">To-Do App</h1>
          <p className="text-slate-600">Manage your tasks efficiently</p>
        </div>

        {/* ========== ADD TODO INPUT SECTION ========== */}
        {/* White card containing input field and add button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3">
            {/* Input field for typing new todos */}
            <input
              type="text"
              value={inputText} // Controlled by React state
              onChange={(e) => setInputText(e.target.value)} // Update state on every keystroke
              onKeyPress={handleKeyPress} // Listen for Enter key
              placeholder="Enter a new task..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading} // Disable during loading
            />
            <button className="hidden"></button>

            {/* Add button */}
            <button
              onClick={addTodo} // Call addTodo when clicked
              disabled={loading || !inputText.trim()} // Disable if loading or input is empty
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <Plus size={20} /> {/* Plus icon from lucide-react */}
              Add Task
            </button>
          </div>
        </div>

        {/* ========== TODO LIST SECTION ========== */}
        {/* White card displaying all todos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* CONDITIONAL RENDERING: Show different UI based on whether todos exist */}
          {todos.length === 0 ? (
            // If no todos exist, show empty state message
            <div className="p-12 text-center text-slate-500">
              <p className="text-lg">No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            // If todos exist, render them as a list
            <ul className="divide-y divide-slate-200">
              {/* MAP FUNCTION: Loop through todos array and create a list item for each */}
              {/* todos.map() creates a new array of JSX elements */}
              {todos.map((todo) => (
                <li
                  key={todo._id} // React requires unique 'key' for list items
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Todo item component */}
                  <TodoItem
                    todo={todo}
                    deleteTodo={deleteTodo}
                    editTodo={editTodo}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ========== TASK COUNTER ========== */}
        {/* Only shown if there are todos (conditional rendering with &&) */}
        {todos.length > 0 && (
          <div className="text-center mt-4 text-slate-600">
            {/* Display count with proper grammar (task vs tasks) */}
            {todos.length} {todos.length === 1 ? "task" : "tasks"} in your list
          </div>
        )}
      </div>
    </div>
  );
}

// Export the component so it can be imported in main.tsx
export default App;
