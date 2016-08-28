const http = require('http');
const url = require('url');

const routes = {};
const middleware = [];
let logger = false;
let gotoNext = true;

function useLogger(option) {
  logger = option;
}

function isValidRoute(request) {
  const validMethods = [
    'POST',
    'GET',
    'PUT',
    'PATCH',
    'DELETE',
  ];

  if (typeof routes[request] !== 'object') {
    return false;
  }
  if (validMethods.indexOf(routes[request].method) === -1) {
    return false;
  }

  // const controller = routes[pathname].controller.split('@');
  // const controllerFile = controller[0];
  // const controllerHandler = controller[1];

  return true;
}

function next() {
  gotoNext = true;
}

function onRequest(req, res) {
  const method = req.method;
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const request = `${method} ${pathname}`;

  if (isValidRoute(request)) {
    middleware.forEach(function (f) {
      if (gotoNext) {
        gotoNext = false;
        f(req, res, next);
      }
    });

    if(!gotoNext) {
      return false;
    }

    if (logger) {
      const date = new Date();
      console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ` +
                  `${method} ${parsedUrl.path}`);
    }
    res.writeHead(200);
    req.query = parsedUrl.query;
    routes[request].controller(req, res);
    res.end();
  } else {
    res.writeHead(500);
    res.end('Invalid route.');
  }
}

function route(method_, path_, controller_) {
  method_ = method_.toUpperCase();

  routes[`${method_} ${path_}`] = {
    path: path_,
    method: method_,
    controller: controller_,
  };
}

function use(f) {
  middleware.push(f);
}

function start(port = 8080) {
  http.createServer(onRequest).listen(port);
}

exports = module.exports = onRequest;
exports.start = start;
exports.route = route;
exports.useLogger = useLogger;
exports.use = use;
