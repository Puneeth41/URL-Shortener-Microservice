const express = require('express');
const dns = require('dns');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Storage (temporary, in-memory)
let urlDatabase = [];
let counter = 1;

app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST: Create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);

    // ✅ Check protocol
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    const hostname = urlObj.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = counter++;

      urlDatabase.push({
        original_url: originalUrl,
        short_url: shortUrl
      });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });

  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET: Redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const entry = urlDatabase.find(e => e.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(entry.original_url);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});