const express = require('express');
const app = express();
const port = 2001;
const { createPool } = require('mysql');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'demobase',
});

// CREATE
app.post('/todo_list', (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday } = req.body;
  const query = `
    INSERT INTO todo_list (Monday, Tuesday, Wednesday, Thursday, Friday)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [monday, tuesday, wednesday, thursday, friday];

  pool.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Insert error' });
    res.status(201).json({ message: 'To-do added', insertId: results.insertId });
  });
});

// READ
app.get('/todo_list', (req, res) => {
  pool.query('SELECT * FROM todo_list', (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // results is an array of rows from MySQL
    res.status(200).json(results); // ✅ return array
  });
});


// UPDATE
app.put('/todo_list/:id', (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday } = req.body;
  const id = req.params.id;

  const query = `
    UPDATE todo_list
    SET Monday = ?, Tuesday = ?, Wednesday = ?, Thursday = ?, Friday = ?
    WHERE id = ?
  `;
  const values = [monday, tuesday, wednesday, thursday, friday, id];

  pool.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: 'Update error' });
    res.json({ message: 'To-do updated' });
  });
});

// DELETE
app.delete('/todo_list/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM todo_list WHERE id = ?';

  pool.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete error' });
    res.json({ message: 'To-do deleted' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
