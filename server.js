const express = require("express");
const dns = require("dns");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// File path
const dbPath = path.join(__dirname, "db.json");

// Helper functions
const readDB = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// FCC test route
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  // Normalize
  if (!/^https?:\/\//i.test(originalUrl)) {
    originalUrl = "http://" + originalUrl;
  }

  try {
    const urlObj = new URL(originalUrl);

    const hostname = urlObj.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      let db = readDB();

      // Check existing
      const existing = db.find((e) => e.original_url === originalUrl);
      if (existing) {
        return res.json(existing);
      }

      const newEntry = {
        original_url: originalUrl,
        short_url: Date.now(), // ✅ always unique, never conflicts
      };

      db.push(newEntry);
      writeDB(db);

      res.json(newEntry);
    });
  } catch {
    res.json({ error: "invalid url" });
  }
});

// GET redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);

  const db = readDB();

  const entry = db.find((e) => e.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: "No short URL found" });
  }

  res.redirect(entry.original_url);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
