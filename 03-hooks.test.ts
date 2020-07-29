
import test from 'ava';


// section one
test.beforeEach( async t => {
  t.log(`before each ${t.title}`);
});

test.afterEach( async t => {
  t.log(`after each ${t.title}`);
});

test('test 1-1', async (t) => {
  t.log(`running ${t.title}`);
  t.pass();
});

test('test 1-2', async (t) => {
  t.log(`running ${t.title}`);
  t.pass();
});



// section two
test.beforeEach( async t => {
  t.log(`anther before each ${t.title}`);
});

test.afterEach( async t => {
  t.log(`anther after each ${t.title}`);
});

test('test 2-1', async (t) => {
  t.log(`running ${t.title}`);
  t.pass();
});

test('test 2-2', async (t) => {
  t.log(`running ${t.title}`);
  t.pass();
});


/*
Current Behavior

Two beforeEach & afterEach hooks are apply for all cases.

I don't think this is a very useful design.
This behavior may be a nice-to-have feature, but definitely not an essential one.
Because we can always achieve the same purpose using different ways.


Suggested Behavior

Each cases should only bind to the one beforeEach & afterEach hooks that are nearest to them.

By implement the hooks this way will make it possible to define different pre-condition in single file.
And it will be useful to implement coroutine based concurrency instead of process one.
*/
