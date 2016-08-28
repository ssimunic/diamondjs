const diamond = require('../lib/diamond');

diamond.useLogger(true);

diamond.route('GET', '/', function(req, res) {
  const name = req.query.name;
  res.write(`Hello ${name}`);
});

diamond.route('POST', '/', function(req, res) {
  res.write('Home post');
});

diamond.start(8080);
