import test from 'ava';
import { semaphore} from "./02-common";
import * as bluebird from "bluebird";

test.beforeEach( async t => {
  await semaphore.wait();
  t.log(`another before each ${t.title}`);
});

test.afterEach( async t => {
  t.log(`another after each ${t.title}`);
  await semaphore.signal();
});

test('test 1-1', async (t) => {
  await bluebird.delay(5e3);
  t.log(`running ${t.title}`);
  t.pass();
});
