import test from 'ava';
import { BrowserObject, remote } from "webdriverio";


const fn = () => 'foo';

test('fn() returns foo', async (t) => {
	const driver: BrowserObject = await remote({
		hostname: 'localhost',
		port: 4444,
		path: '/wd/hub',
		capabilities: {
			browserName: 'chrome',
  },});

	t.is(fn(), 'foo');
});
