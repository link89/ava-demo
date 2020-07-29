import test from 'ava';
import * as bluebird from "bluebird";

test('test 1-1', async (t) => {
  await bluebird.delay(5e3);
  t.log(`running ${t.title}`);
  t.pass();
});
