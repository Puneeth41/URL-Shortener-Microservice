const express = require("express");
const dns = require("dns");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// ✅ In-memory DB (FCC-compatible, no file issues)
let urlDatabase = [];
let counter = 1;

// ✅ Required FCC route
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// ✅ Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ✅ POST: Create short URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  // ❗ Normalize URL (important)
  if (!/^https?:\/\//i.test(originalUrl)) {
    originalUrl = "http://" + originalUrl;
  }

  try {
    const urlObj = new URL(originalUrl);

    // Only allow http/https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    const hostname = urlObj.hostname;

    // DNS validation
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Check if already exists
      const existing = urlDatabase.find(
        (e) => e.original_url === originalUrl
      );

      if (existing) {
        return res.json(existing);
      }

      const newEntry = {
        original_url: originalUrl,
        short_url: counter++
      };

      urlDatabase.push(newEntry);

      res.json(newEntry);
    });

  } catch {
    res.json({ error: "invalid url" });
  }
});

// ✅ GET: Redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);

  const entry = urlDatabase.find(
    (e) => e.short_url === shortUrl
  );

  if (!entry) {
    return res.json({ error: "No short URL found" });
  }

  // ✅ FCC expects proper redirect
  return res.redirect(302, entry.original_url);
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});