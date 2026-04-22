const express = require("express");
const dns = require("dns");
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Storage (temporary, in-memory)
let urlDatabase = [];
let counter = 1;

app.use(express.static("public"));

app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST: Create short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);

    // ✅ Check protocol
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    const hostname = urlObj.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Check if URL already exists
      const existing = urlDatabase.find((e) => e.original_url === originalUrl);

      if (existing) {
        return res.json(existing);
      }

      const shortUrl = counter++;

      const newEntry = {
        original_url: originalUrl,
        short_url: shortUrl,
      };

      urlDatabase.push(newEntry);

      res.json(newEntry);
    });
  } catch {
    res.json({ error: "invalid url" });
  }
});

// GET: Redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = Number(req.params.short_url);

  const entry = urlDatabase.find((e) => e.short_url === shortUrl);

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
