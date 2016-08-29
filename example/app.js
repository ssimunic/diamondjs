const Diamond = require('../lib/diamond');
const morgan = require('morgan');

const server = new Diamond();

// Midleware
server.use((req, res, next) => {
  console.log('Middleware 1 called');
  next();
});
server.use(morgan('dev'));

// View engine setup
server.setViewsDir('example/views');
server.useViewEngine('pug');

// Set controllers directory (only for controller routes)
server.setControllersDir('example/controllers');

// Controller routes
server.route('GET', '/', 'MainController@index');
server.route('GET', '/home', 'MainController@home');

// Straight routes
server.route('GET', '/news', (req, res) => {
  res.render('news');
});

// Short way
server.get('/admin', (req, res) => {
  res.write('Hello admin!');
});

// Start server
server.start(8080);
