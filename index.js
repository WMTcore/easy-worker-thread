'use strict';

const { Pool } = require('tarn');
const { Worker } = require('worker_threads');

const defaultOptions = {
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

class EasyWorkerThread {
  constructor(options = {}) {
    this.options = Object(defaultOptions, options);
    this.workerThreadPoolMap = new Map();
  }

  async createWorkerThread(func = () => {}, args = {}) {
    const pool = this.workerThreadPoolMap.get(func.name) || this._createPool(func);

    const worker = await pool.acquire().promise;
    worker.postMessage(args);

    return new Promise((resolve, reject) => {
      worker.on('message', msg => {
        const { result, error } = msg;
        pool.release(worker);

        if (error) { throw error; }
        resolve(result);
      });

      worker.on('error', e => {
        pool.release(worker);
        reject(e);
      });

      worker.on('exit', () => {
        pool.release(worker);
      });
    });
  }

  _createPool(func) {
    const pool = new Pool(Object.assign({
      create: () => {
        return new Worker(this._createFunctionString(func), { eval: true });
      },
      destroy: worker => {
        worker.terminate();
      },
      validate: worker => {
        return worker.threadId > 0;
      },
    }, this.options));

    this.workerThreadPoolMap.set(func.name, pool);

    return pool;
  }

  _createFunctionString(func) {
    return `
      try {
        const { parentPort } = require('worker_threads');
        parentPort.on('message', async function (args) {
          const result = await (${func.toString()}).call(null, args);
          parentPort.postMessage({ result })
          // process.exit();
        })
      } catch (e) {
        parentPort.postMessage({ error: e })
        // process.exit()
      }`;
  }
}

module.exports = EasyWorkerThread;
