import test from 'ava';

test.beforeEach( t => {
  t.log('before each 2');
});

for (let i = 1; i < 10; i++) {
  test(`test 2-${i}`, async (t) => {
    t.pass();
  });
}