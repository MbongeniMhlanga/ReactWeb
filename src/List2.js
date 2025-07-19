import React, { useState, useEffect, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function List() {
  // Form state
  const [taskInput, setTaskInput] = useState("");
  const [dayInput, setDayInput] = useState("Monday");
  const [tasks, setTasks] = useState({});
  const [editId, setEditId] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [message, setMessage] = useState("");

  // Todos + pagination state
  const [todos, setTodos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ref for CSSTransition to avoid findDOMNode error in React 18+
  const nodeRef = useRef(null);

  // Fetch todos on mount and after submit/delete
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:2001/todo_list");
      const data = await res.json();
      setTodos(data);
      if (data.length > 0) setCurrentIndex(0);
      return data;
    } catch (err) {
      console.error("Error fetching todos:", err);
      setMessage("Could not load todos.");
      return [];
    }
  };

  // Add or update task for a day in form
  const handleAddDayTask = () => {
    if (!taskInput.trim()) {
      setMessage("Task cannot be empty.");
      return;
    }
    if (editingDay) {
      setTasks((prev) => ({ ...prev, [editingDay]: taskInput }));
      setMessage(`Updated task for ${editingDay}.`);
      setEditingDay(null);
    } else {
      if (tasks[dayInput]) {
        setMessage(`${dayInput} already has a task! Click on it to edit.`);
        return;
      }
      setTasks((prev) => ({ ...prev, [dayInput]: taskInput }));
      setMessage(`${dayInput} task added.`);
    }
    setTaskInput("");
  };

  // Submit all tasks to backend (add or update)
  const handleSubmit = async () => {
    if (Object.keys(tasks).length < 5) {
      setMessage("Please enter a task for all 5 weekdays.");
      return;
    }
    const payload = {
      monday: tasks["Monday"] || "",
      tuesday: tasks["Tuesday"] || "",
      wednesday: tasks["Wednesday"] || "",
      thursday: tasks["Thursday"] || "",
      friday: tasks["Friday"] || "",
    };
    const url = editId
      ? `http://localhost:2001/todo_list/${editId}`
      : "http://localhost:2001/todo_list";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok) {
        setMessage(editId ? "Updated!" : "Added!");
        resetForm();
        await fetchTodos();
      } else {
        setMessage(result.message || "Error saving data");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("Server error");
    }
  };

  // Edit full record from saved todos
  const handleEdit = (todo) => {
    setEditId(todo.id);
    setTasks({
      Monday: todo.monday,
      Tuesday: todo.tuesday,
      Wednesday: todo.wednesday,
      Thursday: todo.thursday,
      Friday: todo.friday,
    });
    setMessage("Editing this task set.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete record
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:2001/todo_list/${id}`, { method: "DELETE" });
      setMessage("Deleted");
      await fetchTodos();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      setMessage("Delete failed");
    }
  };

  // Reset form state
  const resetForm = () => {
    setEditId(null);
    setTasks({});
    setTaskInput("");
    setDayInput("Monday");
    setEditingDay(null);
    setMessage("");
  };

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < todos.length - 1 ? prev + 1 : prev));
  };
  const jumpToIndex = (index) => setCurrentIndex(index);

  // Current todo to display
  const currentTodo = todos[currentIndex];

  // Generate summary for preview
  const generateSummary = (todo) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    return days
      .filter((d) => todo[d])
      .slice(0, 2)
      .map(
        (d) =>
          `${d.charAt(0).toUpperCase() + d.slice(1)}: ${
            todo[d].length > 15 ? todo[d].slice(0, 15) + "..." : todo[d]
          }`
      )
      .join(" | ");
  };

  return (
    <div style={containerStyle}>
      <h2>To-Do List</h2>

      {/* Day selector */}
      <div style={rowStyle}>
        <label>Day:</label>
        <select value={dayInput} onChange={(e) => setDayInput(e.target.value)}>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
        </select>
      </div>

      {/* Task input */}
      <div style={rowStyle}>
        <label>Task:</label>
        <input
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter task"
        />
      </div>

      {/* Add/update day task button */}
      <button style={buttonStyle} onClick={handleAddDayTask} disabled={!taskInput.trim()}>
        {editingDay ? `Update ${editingDay}` : "Add Day Task"}
      </button>

      {/* List of added day tasks */}
      {Object.entries(tasks).length > 0 && (
        <div style={{ marginTop: 15 }}>
          <h4>Selected Tasks:</h4>
          <ul>
            {Object.entries(tasks).map(([day, task]) => (
              <li key={day}>
                <strong
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => {
                    setEditingDay(day);
                    setTaskInput(task);
                    setDayInput(day);
                    setMessage(`Editing task for ${day}`);
                  }}
                >
                  {day}:
                </strong>{" "}
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit all tasks button */}
      <button
        style={{ ...buttonStyle, backgroundColor: "#007bff", marginTop: 10 }}
        onClick={handleSubmit}
      >
        {editId ? "Update Set" : "Submit All"}
      </button>

      {/* Feedback message */}
      {message && <p>{message}</p>}

      {/* Show one todo with animation */}
      <h3 style={{ marginTop: 30 }}>
        Saved Task {todos.length > 0 ? `${currentIndex + 1} / ${todos.length}` : ""}
      </h3>
      <div style={{ minHeight: 200, position: "relative" }}>
        <TransitionGroup>
          {currentTodo && (
            <CSSTransition
              key={currentTodo.id}
              timeout={300}
              classNames="fade"
              nodeRef={nodeRef}      // Add nodeRef here
            >
              <div
                ref={nodeRef}         // Attach ref here
                style={{
                  ...rowStyle,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  left: 0,
                  backgroundColor: "#ffffffcc",
                  padding: 15,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) =>
                  currentTodo[day.toLowerCase()] ? (
                    <p key={day} style={{ margin: "4px 0" }}>
                      <strong>{day}:</strong> {currentTodo[day.toLowerCase()]}
                    </p>
                  ) : null
                )}
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => handleEdit(currentTodo)} style={{ marginRight: 10 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(currentTodo.id)}>Delete</button>
                </div>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 15,
        }}
      >
        <button onClick={handlePrev} disabled={currentIndex === 0} style={paginationButtonStyle}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === todos.length - 1 || todos.length === 0}
          style={paginationButtonStyle}
        >
          Next
        </button>
      </div>

      {/* Preview list */}
      <h4 style={{ marginTop: 30 }}>Preview List</h4>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 10,
        }}
      >
        {todos.map((todo, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={todo.id}
              onClick={() => jumpToIndex(index)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 6,
                backgroundColor: isActive ? "#007bff" : "#eee",
                color: isActive ? "white" : "#333",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 0 6px #007bffaa" : "none",
                userSelect: "none",
              }}
              title={generateSummary(todo)}
            >
              {generateSummary(todo)}
            </div>
          );
        })}
      </div>

      {/* Fade animation styles */}
      <style>
        {`
          .fade-enter {
            opacity: 0;
            transform: translateX(20px);
          }
          .fade-enter-active {
            opacity: 1;
            transform: translateX(0);
            transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
          }
          .fade-exit {
            opacity: 1;
            transform: translateX(0);
          }
          .fade-exit-active {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default List;

// Styling objects
const containerStyle = {
  backgroundColor: "#F0F8FF",
  color: "#333",
  padding: 30,
  borderRadius: 10,
  maxWidth: 600,
  margin: "auto",
};

const rowStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 15,
  justifyContent: "space-between",
};

const buttonStyle = {
  backgroundColor: "#28a745",
  padding: "12px 25px",
  borderRadius: 5,
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
};

const paginationButtonStyle = {
  backgroundColor: "#007bff",
  padding: "10px 20px",
  borderRadius: 5,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};
