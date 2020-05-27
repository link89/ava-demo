import test from 'ava';
import { BrowserObject, remote } from "webdriverio";
import * as puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as bluebird from "bluebird";
import * as tmp from 'tmp';
import * as path from 'path';
import * as https from 'https';

import axios from 'axios';


test('webdriver io cdp demo', async (t) => {
	// start webdriver
	const driver: BrowserObject = await remote({
		hostname: 'localhost',
		port: 4444,
		path: '/wd/hub',
		capabilities: {
			browserName: 'chrome',
		},
	});

	// connect with puppeteer
	const debugAddress = driver.capabilities['goog:chromeOptions']?.debuggerAddress;
	const puppeteerDriver = await puppeteer.connect({ browserURL: `http://${debugAddress}` });

	// puppeteer: start to collect js coverage
	const pages = await puppeteerDriver.pages();
	await pages[0].coverage.startJSCoverage({ resetOnNavigation: false });

	// do something with webdriver.io or puppeteer
	await driver.url('https://jupiter.fiji.gliprc.com');
	await bluebird.delay(5e3);
	console.log(`get title via puppeteer: ${await pages[0].title()}`);

	// puppeteer: stop coverage collection
	const coverages: any[] = await pages[0].coverage.stopJSCoverage();  // patched
	fs.writeFileSync('v8-coverage.json', JSON.stringify(coverages, null, 2));

	// fetch js source
	const sourceDir = tmp.dirSync().name;
	console.log(`source dir is ${sourceDir}`);

	const coveragesWithSource = await bluebird.map(coverages.filter(script => script.url.startsWith('http') && script.url.endsWith('.js')), async (script) => {
		const res = await axios.get(script.url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
		const sourceFile = path.join(sourceDir, `${script.scriptId}.js`)
		fs.writeFileSync(sourceFile, res.data);
		return { script, sourceFile };
	}, { concurrency: 2, });

	// TODO: convert v8 coverage to istanbul
	// TODO: handle source map

	// clean up
	await driver.deleteSession();
	t.pass();
});
