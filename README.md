# easy-worker-thread

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/easy-worker-thread.svg?style=flat-square
[npm-url]: https://npmjs.org/package/easy-worker-thread
[snyk-image]: https://snyk.io/test/npm/easy-worker-thread/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/easy-worker-thread
[download-image]: https://img.shields.io/npm/dm/easy-worker-thread.svg?style=flat-square
[download-url]: https://npmjs.org/package/easy-worker-thread

More convenient to use worker thread using the [tarn.js](https://github.com/vincit/tarn.js) maintain thread pool

node 12+

## Install

```bash
$ npm i easy-worker-thread --save
```

## Usage

`Attention`: The scope of the method is isolated for package and variable

```js

const EasyWorkerThread = require('easy-worker-thread');

// reference tarn.js config
const config = {
  min: 0,
  max: 5,
  // acquire promises are rejected after this many milliseconds
  // if a resource cannot be acquired
  acquireTimeoutMillis: 30000,

  // create operations are cancelled after this many milliseconds
  // if a resource cannot be acquired
  createTimeoutMillis: 30000,

  // destroy operations are awaited for at most this many milliseconds
  // new resources will be created after this timeout
  destroyTimeoutMillis: 5000,

  // free resouces are destroyed after this many milliseconds
  idleTimeoutMillis: 30000,

  // how often to check for idle resources to destroy
  reapIntervalMillis: 1000,

  // how long to idle after failed create before trying again
  createRetryIntervalMillis: 200,

  // If true, when a create fails, the first pending acquire is
  // rejected with the error. If this is false (the default) then
  // create is retried until acquireTimeoutMillis milliseconds has
  // passed.
  propagateCreateError: false,
};

const easyWorkerThread = new EasyWorkerThread(config);

const _ = require('lodash')
const foo = 'bar';

// The parameter need to be object for more arguments
async function test({ param1, param2 }) {
  const _ = require('lodash') // require again
  console.error(foo); // undefined

  return 'bar';
}

await easyWorkerThread.createWorkerThread(test, { param1, param2 }) // 'bar'
```

## License

[MIT](LICENSE)
