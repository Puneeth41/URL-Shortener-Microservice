const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let database = [];
let counter = 1;

app.post('/api/shorturl', function(req, res) {

  const inputUrl = req.body.url;

  let hostname;

  try {
    hostname = new URL(inputUrl).hostname;
  } catch(err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {

    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const entry = {
      original_url: inputUrl,
      short_url: counter++
    };

    database.push(entry);

    return res.json(entry);
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {

  const short = parseInt(req.params.short_url);

  const found = database.find(
    item => item.short_url === short
  );

  if (!found) {
    return res.json({
      error: 'No short URL found'
    });
  }

  return res.redirect(found.original_url);
});

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port ' + listener.address().port);
});