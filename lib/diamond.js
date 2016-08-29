const http = require('http');
const url = require('url');

const routes = {};
const middleware = [];
let logger = false;
let gotoNext = true;
let controllersDir = 'controllers';

function setControllersDir(dir) {
  controllersDir = dir;
}

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

  if (typeof routes[request].controller === 'string') {
    if (routes[request].controller.indexOf('@') === -1) {
      return false;
    }

    const controller = routes[request].controller.split('@');
    const controllerFile = controller[0];
    const controllerHandler = controller[1];
    const controllerModule = require(`${process.env.PWD}/${controllersDir}/${controllerFile}.js`);

    if (typeof controllerModule[controllerHandler] !== 'function') {
      return false;
    }

    routes[request].controller = controllerModule[controllerHandler];
  }

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
    middleware.forEach((f) => {
      if (gotoNext) {
        gotoNext = false;
        f(req, res, next);
      } else {
        return;
      }
    });

    if (!gotoNext) {
      return;
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
exports.use = use;
exports.setControllersDir = setControllersDir;
exports.useLogger = useLogger;

exports.post = (path, controller) => { route('POST', path, controller); };
exports.get = (path, controller) => { route('GET', path, controller); };
exports.put = (path, controller) => { route('PUT', path, controller); };
exports.patch = (path, controller) => { route('PATCH', path, controller); };
exports.delete = (path, controller) => { route('DELETE', path, controller); };
