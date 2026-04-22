const express = require("express");
const dns = require("dns");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// ✅ In-memory storage
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

// ✅ POST: create short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);

    // ✅ Only allow http/https
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    const hostname = urlObj.hostname;

    // ✅ DNS validation
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // ✅ Reuse existing URL (important for FCC tests)
      const existing = urlDatabase.find(
        (e) => e.original_url === originalUrl
      );

      if (existing) {
        return res.json(existing);
      }

      const newEntry = {
        original_url: originalUrl,
        short_url: counter++,
      };

      urlDatabase.push(newEntry);

      res.json(newEntry);
    });
  } catch (err) {
    res.json({ error: "invalid url" });
  }
});

// ✅ GET: redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = Number(req.params.short_url);

  const entry = urlDatabase.find((e) => e.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: "No short URL found" });
  }

  let url = entry.original_url;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }

  // ✅ FORCE proper redirect status
  res.writeHead(302, { Location: url });
  res.end();
});

// ✅ Start server (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});