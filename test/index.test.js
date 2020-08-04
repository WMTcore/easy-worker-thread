'use strict';

const assert = require('assert');
const EasyWorkerThread = require('..');

describe('easy-worker-thread', () => {
  describe('Offload CPU-intensive tasks to worker threads', () => {
    it('should faster then before', async () => {
      const easyWorkerThread = new EasyWorkerThread();

      let time = Date.now();
      function calculate() {
        // eslint-disable-next-line no-empty
        for (let i = 0; i < 2000000000; i++) {}
      }

      await Promise.all([
        calculate(),
        calculate(),
        calculate() ]);

      const spendTime = Date.now() - time;

      time = Date.now();
      await Promise.all([
        easyWorkerThread.createWorkerThread(calculate),
        easyWorkerThread.createWorkerThread(calculate),
        easyWorkerThread.createWorkerThread(calculate) ]);

      assert(spendTime / 2 > Date.now() - time);
    });
  });
});
