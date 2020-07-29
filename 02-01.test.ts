import test from 'ava';

test.beforeEach( t => {
  t.log('before each 1');
});


test('test 1-1', async (t) => {
  t.pass();
});

test('test 1-2', async (t) => {
  t.pass();
});
