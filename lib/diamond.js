const http = require('http');
const url = require('url');

/**
 * Diamond JS
 */
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

  /**
   * Set directory path of controllers
   * @param {string} dir Controllers directory
   */
  function setControllersDir(dir) {
    controllersDir = dir;
  }

  /**
   * Set directory path of controllers
   * @param {string} dir Views directory
   */
  function setViewsDir(dir) {
    viewsDir = dir;
  }

  /**
   * Enable built-in logger
   * @param  {boolean} option Enable logger
   */
  function useLogger(option) {
    logger = option;
  }

  /**
   * Check if request is valid and exists
   * @param  {string}  request Request
   */
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

  /**
   * Load view engine
   */
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

  /**
   * Go to next middleware
   */
  function next() {
    gotoNext = true;
  }

  /**
   * Main request handler
   * @param  {Object} req Request
   * @param  {Object} res Response
   */
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

  /**
   * [route description]
   * @param  {string} method     Method
   * @param  {string} path       Path
   * @param  {string} controller Controller
   */
  function route(method, path, controller) {
    const methodUpper = method.toUpperCase();

    routes[`${methodUpper} ${path}`] = {
      path,
      method,
      controller,
    };
  }

  /**
   * Use middleware
   * @param  {object} f Function
   */
  function use(f) {
    middleware.push(f);
  }

  /**
   * Set view engine
   * @param  {string selectedEngine View engine
   */
  function useViewEngine(selectedEngine) {
    viewEngine = selectedEngine;
  }

  /**
   * Start server
   * @param  {Number} [port=8080] Port
   */
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
