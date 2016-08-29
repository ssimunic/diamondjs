const diamond = require('../lib/diamond');
const morgan = require('morgan');

// Midleware
diamond.use((req, res, next) => {
  console.log('Middleware 1 called');
  next();
});
diamond.use(morgan('dev'));

// Set controllers directory (only for controller routes)
diamond.setControllersDir('example/controllers');

// Controller routes
diamond.route('GET', '/', 'MainController@index');
diamond.route('GET', '/home', 'MainController@home');

// Straight routes
diamond.route('GET', '/news', (req, res) => {
  res.write('Hello news!');
});

// Short way
diamond.get('/admin', (req, res) => {
  res.write('Hello admin!');
});

// Start server
diamond.start(8080);
