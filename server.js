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

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  let urlObj;

  try {
    urlObj = new URL(originalUrl);
  } catch {
    return res.json({ error: "invalid url" });
  }

  if (
    urlObj.protocol !== "http:" &&
    urlObj.protocol !== "https:"
  ) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const newEntry = {
      original_url: originalUrl,
      short_url: counter++
    };

    urlDatabase.push(newEntry);

    return res.json(newEntry);
  });
});

// ✅ GET: Redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = Number(req.params.short_url);

  const entry = urlDatabase.find(
    (item) => item.short_url === shortUrl
  );

  if (!entry) {
    return res.status(404).json({
      error: "No short URL found"
    });
  }

return res.redirect(302, entry.original_url);
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});