import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cors from "cors";
import cookieParser from "cookie-parser";
import mysqlConnection from "./db-connection.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

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
      setLoginCookie(res, username);

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
    const results = await mysqlConnection.query(query, [username]);

    if (results.length > 0) {
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        setLoginCookie(res, username);
        res.status(200).send("Login successful");
      } else {
        res.status(401).send("Incorrect password");
      }
    } else {
      res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error querying database or comparing passwords:", error);
    res.status(500).send("Internal Server Error");
  }
}

function setLoginCookie(res, username) {
  if (!res.cookies.key) {
    res.cookie("key", username, {
      maxAge: 604800000, // 7 hari dalam milidetik
      expires: new Date(Date.now() + 604800000), // 7 hari dari sekarang
      secure: true, // Hanya dapat diakses melalui HTTPS,
      path: "/",
    });
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
