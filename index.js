import mysqlConnection from "./db-connection.js";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Koneksi database Mysql
mysqlConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    throw err;
  }
  console.log("Connected to database");
});

app.get('/', (req, res) => res.status(200).send('Selamat datang di API api-blind-code'))

// Registrasi
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash password sebelum menyimpan ke database
    bcrypt.hash(password, 10, function (err, hash) {
      const query = "INSERT INTO users (username, password) VALUES (?, ?)";
      mysqlConnection.query(
        query,
        [username, hash],
        (err, result) => {
          if (err) {
            console.error("Error registering user:", err);
            res.status(500).send("Error registering user");
          } else {
            res.status(201).send("User registered successfully");
          }
        }
      );
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send("Error hashing password");
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  mysqlConnection.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Error querying database");
    } else if (results.length > 0) {
      try {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
          res.status(200).send("Login successful");
        } else {
          res.status(401).send("Incorrect password");
        }
      } catch (error) {
        console.error("Error comparing passwords:", error);
        res.status(500).send("Error comparing passwords");
      }
    } else {
      res.status(401).send("User not found");
    }
  });
});

// Menangani penutupan koneksi setelah server berhenti
process.on("SIGINT", () => {
  console.log("Closing database connection");
  mysqlConnection.end((err) => {
    if (err) {
      console.error("Error closing database connection:", err);
      process.exit(1);
    }
    console.log("Database connection closed");
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
