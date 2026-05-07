const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.use(express.static("public"));

// Home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Test route
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// In-memory database
let urls = [];
let id = 1;

// Create short URL
app.post("/api/shorturl", (req, res) => {

  console.log(req.body);

  const original_url = req.body.url;

  console.log(original_url);

  let parsedUrl;

  try {
    parsedUrl = new URL(original_url);
  } catch {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsedUrl.hostname, (err) => {

    if (err) {
      return res.json({ error: "invalid url" });
    }

    const short_url = id++;

    urls.push({
      original_url,
      short_url
    });

    console.log(urls);

    res.json({
      original_url,
      short_url
    });
  });
});

// Redirect route
app.get("/api/shorturl/:short_url", (req, res) => {

  const short_url = parseInt(req.params.short_url);

  const found = urls.find(
    (item) => item.short_url === short_url
  );

  if (!found) {
    return res.json({
      error: "No short URL found"
    });
  }

  res.writeHead(301, {
    Location: found.original_url
  });

  return res.end();
});

// Start server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});