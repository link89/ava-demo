import test from 'ava';
import { semaphore } from "./02-common";
import * as bluebird from "bluebird";

test.beforeEach( async t => {
  await semaphore.wait();
  t.log(`before each ${t.title}`)
});

test.afterEach( async t => {
  t.log(`after each ${t.title}`);
  await semaphore.signal();
});

for (let i = 1; i < 10; i++) {
  test(`test 2-${i}`, async (t) => {
    await bluebird.delay(5e3);
  t.log(`running ${t.title}`);
    t.pass();
  });
}