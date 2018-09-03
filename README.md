# Node follow redirects
Drop-in replacement for Nodes http and https that automatically follows redirects, it can also follow http2 redirects.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]


node-follow-redirects provides mimic the native http and https modules, with the exception these will seamlessly follow redirects in http1.1 / https1.1 / http2 .
It will automatically use https1.1 / http2 when needed according to server protocol.
To be http2 compatible it uses [http2-client](https://www.npmjs.com/package/http2-client).
To follow redirects it uses [follow-redirects](https://www.npmjs.com/package/follow-redirects) - expect the API to be identical just with http2 support.

```js
const {http , https , http2} = require('node-follow-redirects');
//You can follow http1.1 redirect
http.get('http://bit.ly/900913', (response) =>{
        response.on('data',  console.log );
    })
    .on('error', console.error );
//You can follow http2 / https1.1 redirect
http2.get('http://bit.ly/900913', (response) =>{
        response.on('data',  console.log );
    })
    .on('error', console.error );
```

You can inspect the final redirected URL through the `responseUrl` property on the `response`.
If no redirection happened, `responseUrl` is the original request URL.


```js
http2.request({
  host: 'bitly.com',
  path: '/UHfDGO',
}, function (response) {
  console.log(response.responseUrl);
  // 'http://duckduckgo.com/robots.txt'
});
```

## Options
### Global options
Global options are set directly on the `node-follow-redirects` module:

```javascript
const nodeFollowRedirects = require('node-follow-redirects');
nodeFollowRedirects.maxRedirects = 10;
nodeFollowRedirects.maxBodyLength = 20 * 1024 * 1024; // 20 MB
```

The following global options are supported:

- `maxRedirects` (default: `21`) – sets the maximum number of allowed redirects; if exceeded, an error will be emitted.

- `maxBodyLength` (default: 10MB) – sets the maximum size of the request body; if exceeded, an error will be emitted.


### Per-request options
Per-request options are set by passing an `options` object:

```javascript
const url = require('url');
const {http2} = require('node-follow-redirects');

const options = url.parse('https://bit.ly/900913');
options.maxRedirects = 10;
http2.request(options);
```

In addition to the [standard HTTP](https://nodejs.org/api/http.html#http_http_request_options_callback) and [HTTPS options](https://nodejs.org/api/https.html#https_https_request_options_callback),
the following per-request options are supported:
- `followRedirects` (default: `true`) – whether redirects should be followed.

- `maxRedirects` (default: `21`) – sets the maximum number of allowed redirects; if exceeded, an error will be emitted.

- `maxBodyLength` (default: 10MB) – sets the maximum size of the request body; if exceeded, an error will be emitted.

- `agents` (default: `undefined`) – sets the `agent` option per protocol, since HTTP and HTTPS use different agents. Example value: `{ http: new http.Agent(), https: new https.Agent() }`

- `trackRedirects` (default: `false`) – whether to store the redirected response details into the `redirects` array on the response object.


### Advanced usage
By default, `node-follow-redirects` will use the Node.js default implementations
of [`http`](https://nodejs.org/api/http.html)
and [`https`](https://nodejs.org/api/https.html) or [`http2-client`](https://www.npmjs.com/package/http2-client) .
To enable features such as caching and/or intermediate request tracking,
you might instead want to wrap `node-follow-redirects` around custom protocol implementations:

```javascript
var followRedirects = require('node-follow-redirects').wrap({
  http: require('your-custom-http'),
  https: require('your-custom-https'),
});
```

Such custom protocols only need an implementation of the `request` method.

## Features
Transparently supports all http protocol.
  * Http/1.1
  * Https/1.1
  * Http/2.0

In case of http1.1 the connection pool is managed as usual with an http agent.
In case of http2 all requests use a signle connection (per domain/port ).

```js
//The following will create a single http2 connection to the server
http2.get('https://www.google.com', (response) =>{
        response.on('data',  console.log );
    })
    .on('error', console.error );
http2.get('https://www.google.com', (response) =>{
        response.on('data',  console.log );
    })
    .on('error', console.error );
http2.get('https://www.google.com', (response) =>{
        response.on('data',  console.log );
    })
    .on('error', console.error );
```
## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/node-follow-redirects.svg
[npm-url]: https://npmjs.org/package/node-follow-redirects
[travis-image]: https://img.shields.io/travis/hisco/node-follow-redirects/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/node-follow-redirects
[snyk-image]: https://snyk.io/test/github/hisco/node-follow-redirects/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/hisco/node-follow-redirects/badge.svg?targetFile=package.json