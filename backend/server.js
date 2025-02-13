const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "tetraflex",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// API Endpoint to Get New Entries
app.get("/new_entries", (req, res) => {
  const query = 'SELECT latitude, longitude, timestamp, DbId FROM _masterdecode';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(results);
  });
});

// API Endpoint to Insert Data
app.post("/insert", (req, res) => {
  const { id } = req.body;
  const query = 'INSERT INTO sdsdata SELECT * FROM sdsdata_ WHERE DbId = ?;';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database insert failed" });
      return;
    }
    res.json({ success: true, id: result.insertId });
  });
});

// API Endpoint to Delete Data
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM sdsdata WHERE DbId = ?;';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database delete failed" });
        return;
      }
      res.json({ success: true, id: result.insertId });
    });
  });

// Register User
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Ensure only 'admin' can create an admin account
  const userRole = role === "admin" ? "admin" : "user";

  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, userRole],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User registered successfully!" });
    }
  );
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1h" });

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});



// Get Users
app.get("/users", (req, res) => {
  db.query("SELECT id, username FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Update User
app.put("/users/:id", (req, res) => {
  const { username } = req.body;
  db.promise.query("UPDATE users SET username = ? WHERE id = ?", 
    [username, req.params.id], 
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User updated successfully!" });
    }
  );
});

// Delete User
app.delete("/users/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully!" });
  });
});

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Unauthorized" });

  jwt.verify(token, "secret_key", (err, decoded) => {
    if (err || decoded.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  });
};

// Protect the user management routes
app.get("/admin/users", verifyAdmin, (req, res) => {
  db.query("SELECT id, username, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
