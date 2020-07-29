import test from 'ava';
import * as bluebird from "bluebird";


for (let i = 1; i < 10; i++) {
  test(`test 2-${i}`, async (t) => {
    await bluebird.delay(5e3);
    t.log(`running ${t.title}`);
    t.pass();
  });
}