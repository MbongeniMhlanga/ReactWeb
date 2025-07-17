import React, { useState, useEffect } from "react";

function List() {
  const [monday, setMonday] = useState("");
  const [tuesday, setTuesday] = useState("");
  const [wednesday, setWednesday] = useState("");
  const [thursday, setThursday] = useState("");
  const [friday, setFriday] = useState("");
  const [message, setMessage] = useState("");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);

  // 🔁 Load to-do items
  useEffect(() => {
    fetch("http://localhost:2001/todo_list")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleSubmit = async () => {
    const payload = { monday, tuesday, wednesday, thursday, friday };

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
        setMessage(editId ? "✅ To-do updated!" : "✅ To-do added!");
        setEditId(null);
        resetForm();
        fetch("http://localhost:2001/todo_list")
          .then((res) => res.json())
          .then((data) => setTodos(data));
      } else {
        setMessage("❌ Error: " + result.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("❌ Server error");
    }
  };

  const handleEdit = (todo) => {
    setEditId(todo.id);
    setMonday(todo.Monday);
    setTuesday(todo.Tuesday);
    setWednesday(todo.Wednesday);
    setThursday(todo.Thursday);
    setFriday(todo.Friday);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:2001/todo_list/${id}`, { method: "DELETE" });
      setMessage("🗑️ To-do deleted!");
      setTodos(todos.filter((t) => t.id !== id));
    } catch {
      setMessage("❌ Failed to delete.");
    }
  };

  const resetForm = () => {
    setMonday(""); setTuesday(""); setWednesday(""); setThursday(""); setFriday("");
  };

  return (
    <div style={containerStyle}>
      <h2>To-do List</h2>

      {[["Monday", monday, setMonday], ["Tuesday", tuesday, setTuesday], ["Wednesday", wednesday, setWednesday],
        ["Thursday", thursday, setThursday], ["Friday", friday, setFriday]].map(([day, value, setter]) => (
        <div key={day} style={rowStyle}>
          <label>{day}:</label>
          <input value={value} onChange={(e) => setter(e.target.value)} />
        </div>
      ))}

      <button style={buttonStyle} onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      {message && <p>{message}</p>}

      <h3>📋 Saved To-dos:</h3>
      {todos.map((todo) => (
        <div key={todo.id} style={{ ...rowStyle, flexDirection: "column", alignItems: "flex-start" }}>
          <p><strong>Mon:</strong> {todo.Monday}</p>
          <p><strong>Tue:</strong> {todo.Tuesday}</p>
          <p><strong>Wed:</strong> {todo.Wednesday}</p>
          <p><strong>Thu:</strong> {todo.Thursday}</p>
          <p><strong>Fri:</strong> {todo.Friday}</p>
          <div>
            <button onClick={() => handleEdit(todo)} style={{ marginRight: "10px" }}>Edit</button>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default List;
const containerStyle = {
  backgroundColor: "#78E8F8",
  color: "#222",
  padding: "30px",
  borderRadius: "8px",
  maxWidth: "400px",
  margin: "auto",
};

const rowStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginBottom: "10px",
  justifyContent: "space-between",
};

const buttonStyle = {
  backgroundColor: "#007BFF",
  padding: "15px 30px",
  borderRadius: "5px",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  marginTop: "20px",
};
