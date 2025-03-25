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
  password: "TetraFlex",
  database: "tetraflexlogdb",
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
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(result);
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

app.get("/get-detail/:id", (req, res) => {
  const id = req.params.id;
  const query = 'SELECT username, email FROM details WHERE id = ?;';

  db.query(query, [id], (err, result) => {
    if(err) {
      console.error(err);
      res.status(500).json({ error: "Get detail failed" });
      return;
    }
    res.json(result);
  });
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
