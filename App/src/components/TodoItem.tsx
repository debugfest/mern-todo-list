/**
 * TODO ITEM COMPONENT - React Frontend
 *
 * This component represents a single todo item in the list.
 * It displays the todo text and provides options to edit or delete the item.
 *
 * KEY CONCEPTS FOR BEGINNERS:
 * - Props: Data passed to components (used in child elements like buttons)
 * - State: Local component state for managing edit mode
 * - Event Handlers: Functions that handle user interactions (e.g., button clicks)
 */

import { Trash2, Edit, Save, XCircle } from "lucide-react"; // Icon components for UI
import React, { useState } from "react"; // React library and useState hook for managing component state
import { Todo } from "../App"; // Importing the Todo type from App for type safety

/**
 * TYPESCRIPT INTERFACE
 *
 * Defines the structure of a Todo item and the props for the component.
 * This helps catch errors during development by enforcing the shape of data.
 *
 * PROPERTIES:
 * - todo: The todo item object containing:
 *   - _id: Unique identifier from MongoDB (the underscore is MongoDB convention)
 *   - text: The task description
 *   - createdAt: ISO timestamp string when todo was created
 * - deleteTodo: Delete event handler for a todo by its ID
 * - editTodo: Edit event handler for a todo's text by its ID
 */
interface TodoItemProps {
  todo: Todo;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, text: string) => Promise<string | null>;
}

/**
 * TODO ITEM COMPONENT
 *
 * The main component that renders a single todo item.
 * Manages its own state for editing and displays the todo text.
 */
const TodoItem: React.FC<TodoItemProps> = ({
  todo: { _id, text },
  deleteTodo,
  editTodo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [error, setError] = useState("");

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * handleEditClick - Edit Mode Toggle Handler
   *
   * PURPOSE: Enable edit mode for the todo item
   *
   * PROCESS:
   * 1. Set isEditing state to true to show input field
   * 2. Initialize editText state with current todo text
   *
   * UX IMPROVEMENT: Users can easily switch to edit mode to modify tasks
   */
  const handleEditClick = () => {
    setIsEditing(true);
    setEditText(text);
  };

  /**
   * handleSaveClick - Save Edit Handler
   *
   * PURPOSE: Save the edited todo text and exit edit mode
   *
   * PROCESS:
   * 1. Call editTodo function with todo ID and updated text
   * 2. Set isEditing state to false to exit edit mode
   *
   * UX IMPROVEMENT: Users can quickly save changes and return to normal view
   */
  const handleSaveClick = async () => {
    // Call editTodo and await potential error message
    const errorMsg = await editTodo(_id, editText);

    // If there's an error message, display it; otherwise, exit edit mode
    if (errorMsg) {
      // Display error message if edit fails
      setError(errorMsg);
    } else {
      // Clear error and exit edit mode on success
      setIsEditing(false);
      setError("");
    }
  };

  /**
   * handleCancelClick - Cancel Edit Handler
   *
   * PURPOSE: Exit edit mode without saving changes
   *
   * PROCESS:
   * 1. Set isEditing state to false to exit edit mode
   * 2. Reset editText state to original text to discard changes
   *
   * UX IMPROVEMENT: Users can easily revert accidental edits
   */
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditText(text);
  };

  /**
   * handleKeyDown - Keyboard Event Handler
   *
   * PURPOSE: Allow users to save edits by pressing Enter key
   *
   * PROCESS:
   * 1. Check if the pressed key is Enter
   * 2. If yes, trigger the handleSaveClick function
   *
   * PARAMETERS:
   * @param e - React keyboard event object containing key information
   *
   * UX IMPROVEMENT: Users can save edits without clicking the button
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter key is pressed, save the edit
    if (e.key === "Enter") {
      handleSaveClick();
    }
  };

  /**
   * handleChange - Input Change Handler
   *
   * PURPOSE: Update the editText state as the user types in the input field
   *
   * PROCESS:
   * 1. Update editText state with the current value from the input field
   * 2. Clear any existing error messages when user starts typing
   *
   * PARAMETERS:
   * @param value - The current value of the input field
   *
   * UX IMPROVEMENT: Provides real-time feedback and error clearing
   */
  const handleChange = (value: string) => {
    // Update the editText state with the new input value
    setEditText(value);
    if (error) {
      // Clear error message when user starts typing
      setError("");
    }
  };

  // ========================================
  // JSX RENDER - UI STRUCTURE
  // ========================================
  // Everything below is the UI that gets displayed to users regarding Todo items
  // It includes conditional rendering based on edit mode state
  // JSX looks like HTML but is actually JavaScript

  return (
    <>
      {/* Action buttons container */}
      {isEditing ? (
        <>
          {/* ========== EDIT MODE SECTION ========== */}
          {/* Input field for editing todo text */}
          <div className="flex flex-col flex-1">
            <input
              type="text"
              value={editText}
              onChange={(e) => handleChange(e.target.value)} // Update state on input change
              onKeyDown={handleKeyDown}
              className={`flex-1 px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? "border-red-500 focus:ring-red-500" : "border-slate-300"
              }`}
            />
            {/* Display error message if present */}
            {error && (
              <span className="text-red-500 text-sm mt-1">{error}</span>
            )}
          </div>

          {/* Save and Cancel buttons */}
          <div className="flex items-center space-x-1">
            {/* Save button */}
            <button
              onClick={handleSaveClick} // Save edited text
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Save Edit"
            >
              <Save size={20} />
            </button>

            {/* Cancel button */}
            <button
              onClick={handleCancelClick} // Cancel edit mode
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              title="Cancel edit"
            >
              <XCircle size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ========== VIEW MODE SECTION ========== */}
          {/* Todo text display */}
          <span className="text-slate-800 text-lg">{text}</span>

          {/* Edit and Delete buttons */}
          <div className="flex items-center space-x-1">
            {/* Delete button */}
            <button
              onClick={() => deleteTodo(_id)} // Call deleteTodo with the todo ID
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={20} />{" "}
              {/* Trash icon for delete action from lucide-react */}
            </button>

            {/* Edit button */}
            <button
              onClick={handleEditClick} // Switch to edit mode
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit size={20} />{" "}
              {/* Edit icon for edit action from lucide-react */}
            </button>
          </div>
        </>
      )}
    </>
  );
};

// Exporting the component to be used in other parts of the app
export default TodoItem;
