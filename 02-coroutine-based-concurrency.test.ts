/* a POC of coroutine based concurrency instead of process based

Benefits:
1. Easy to share global states between all cases (for example, a webdriver pool with 10 browsers)
2. More efficient when cases number in files are different

For cpu intensive tests process based one is still a good option.
But for io intensive test (like webdriver based), coroutine based concurrency will be more feasible
*/

import { EventEmitter } from 'events';
import test from 'ava';

// implement semaphore for concurrency control
const SIGNAL_EVT = Symbol();
class Semaphore {

  ee: EventEmitter;

  constructor(private size: number) {
    this.ee = new EventEmitter();
    this.ee.setMaxListeners(1e3);
  }

  async wait() {
    while (this.size - 1 < 0)  {
      await new Promise((resolve) => this.ee.once(SIGNAL_EVT, resolve));
    }
    this.size -= 1;
  }

  signal() {
    this.size += 1;
    this.ee.emit(SIGNAL_EVT);
  }
}

// using beforeEach & afterEach hooks for concurrency control
const semaphore = new Semaphore(2);
test.beforeEach( async t => {
  await semaphore.wait();
  t.log(`another before each ${t.title}`);
});

test.afterEach( async t => {
  t.log(`another after each ${t.title}`);
  await semaphore.signal();
});


// import all scripts into a single file (can use dynamic import with glob in real battlefield)
// and execute this file, that's all!
import './02-01.test';
import './02-02.test';
