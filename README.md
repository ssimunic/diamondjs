<p align="center">
  <img src="http://i.imgur.com/x9gdlaL.png" alt="Diamond JS" width="100"/>
</p>
<p align="center">
  Minimalist web framework for Node.js
</p>
<p align="center">
  <a href="https://badge.fury.io/js/diamondjs"><img src="https://badge.fury.io/js/diamondjs.svg" alt="npm version" height="18"></a>
</p>

# Installation

```bash
npm install diamondjs
```

# Basic example

```js
const Diamond = require('diamondjs');

const server = new Diamond();

server.get('/', (req, res) => {
  res.write('Hello world!');
});

server.start(8080);
```

# Docs

## Module initialization

```js
const Diamond = require('diamondjs');

const server = new Diamond();
```

## Starting server

```js
const port = 8080;
server.start(port);
```

## Midleware

### Custom

```js
server.use((req, res, next) => {
  console.log('Middleware 1 called');
  next();
});
```

### Modules

```js
const morgan = require('morgan');
server.use(morgan('dev'));
```


## Routing

Supported methods are  ```POST GET PUT PATCH DELETE```

### Basic

```js
server.route('GET', '/news', (req, res) => {
  res.write('Hello news!');
});

server.route('POST', ...);
server.route('PUT', ...);
server.route('PATCH', ...);
server.route('DELETE', ...);
```

### Basic short

```js
server.get('/admin', (req, res) => {
  res.write('Hello admin!');
});

server.post(...);
server.put(...);
server.patch(...);
server.delete(...);
```

### Controller route

**app.js**

```js
// Set controllers directory (optional, default is controllers)
// server.setControllersDir('example/controllers');

server.route('GET', '/', 'MainController@index');
server.route('GET', '/home', 'MainController@home');
```

**controllers/MainController.js**

```js
exports.index = (req, res) => {
  res.write('Index');
};

exports.home = (req, res) => {
  res.write('Home');
};
```

## View engine

Only ```pug``` view engine is supported for now.

### Setup

```js
// Set controllers directory (optional, default is views)
// server.setViewsDir('example/views');

server.useViewEngine('pug');
```

### Render

```js
// This will render views/news.pug

server.route('GET', '/news', (req, res) => {
  res.render('news');
});
```
