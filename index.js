import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cors from "cors";
import mysqlConnection from "./db-connection.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

mysqlConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    throw err;
  }
  console.log("Connected to database");
});

app.get("/", (req, res) => {
  res.status(200).send("Selamat datang di API api-blind-code");
});

// Registrasi
app.post("/register", registerUser);

// Login
app.post("/login", loginUser);

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

function registerUser(req, res) {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Error hashing password");
      return;
    }

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    mysqlConnection.query(query, [username, hash], (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Error registering user");
        return;
      }
      res.status(201).send("User registered successfully");
    });
  });
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE username = ?";

    mysqlConnection.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Error registering user");
        return;
      }

      if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
          res.status(200).send("Login successful");
        } else {
          res.status(401).send("Incorrect password");
        }
      } else {
        res.status(401).send("User not found");
      }
    });
  } catch (error) {
    console.error("Error querying database or comparing passwords:", error);
    res.status(500).send("Internal Server Error");
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
