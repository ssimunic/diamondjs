const http = require('http');
const url = require('url');

function Diamond() {
  const routes = {};
  const middleware = [];
  let controllersDir = 'controllers';
  let viewsDir = 'views';
  let logger = false;
  let gotoNext;
  let viewEngine;
  let viewEngineModule;
  let viewEngineRender;

  function setControllersDir(dir) {
    controllersDir = dir;
  }

  function setViewsDir(dir) {
    viewsDir = dir;
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

  function loadViewEngine() {
    if (typeof viewEngine === 'undefined') {
      return;
    }
    if (viewEngine.length > 0 && typeof viewEngine === 'string') {
      if (viewEngine === 'pug') {
        viewEngineModule = require('pug');
      }
    }
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
      gotoNext = true;
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

      loadViewEngine();

      viewEngineRender = function (file, options) {
        const html = viewEngineModule.renderFile(`${process.env.PWD}/${viewsDir}/${file}.pug`, options);
        res.write(html);
      };

      res.render = viewEngineRender;

      routes[request].controller(req, res);
      res.end();
    } else {
      res.writeHead(500);
      res.end('Invalid route.');
    }
  }

  function route(method, path, controller) {
    const methodUpper = method.toUpperCase();

    routes[`${methodUpper} ${path}`] = {
      path,
      method,
      controller,
    };
  }

  function use(f) {
    middleware.push(f);
  }

  function useViewEngine(selectedEngine) {
    viewEngine = selectedEngine;
  }

  function start(port = 8080) {
    http.createServer(onRequest).listen(port);
  }

  return {
    onRequest,
    start,
    route,
    use,
    setControllersDir,
    setViewsDir,
    useLogger,
    useViewEngine,
    post: (path, controller) => { route('POST', path, controller); },
    get: (path, controller) => { route('GET', path, controller); },
    put: (path, controller) => { route('PUT', path, controller); },
    patch: (path, controller) => { route('PATCH', path, controller); },
    delete: (path, controller) => { route('DELETE', path, controller); },
  };
}

module.exports = Diamond;
