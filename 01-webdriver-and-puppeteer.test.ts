import test from 'ava';
import { BrowserObject, remote } from "webdriverio";
import * as puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as bluebird from "bluebird";
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';

const v8ToIstanbul = require('v8-to-istanbul');  // FIXME

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
  // TODO: puppeteer is not required, anything can communicate with cdp can work
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
  const outputFolder = process.env.OUTPUT || 'output';
  fs.mkdirSync(outputFolder);
  console.log(`output folder is ${outputFolder}`);

  const sourceDir = path.join(outputFolder, 'sources');
  fs.mkdirSync(sourceDir);
  const coveragesWithSource = await bluebird.map(coverages.filter(script => script.url.startsWith('http') && script.url.endsWith('.js')), async (script) => {
    // download source file
    const res = await axios.get(script.url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const sourceMapFile = res.data.match(/sourceMappingURL=(.+\.map)/)[1];
    const sourceFile = sourceMapFile.replace(/\.map$/, '');
    const scriptPath = path.join(sourceDir, sourceFile);
    fs.writeFileSync(scriptPath, res.data);
    // download source map file
    const res1 = await axios.get(`${script.url}.map`, { transformResponse: [], httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const sourceMapPath = path.join(sourceDir, sourceMapFile);
    fs.writeFileSync(sourceMapPath, res1.data);

    return { script, scriptPath, sourceMapPath };
  }, { concurrency: 2, });

  // convert v8 coverage to istanbul
  // FIXME: v8-to-istanbul: source-mappings from one to many files not yet supported
  const istanbulDir = path.join(outputFolder, 'istanbul');
  fs.mkdirSync(istanbulDir);
  await bluebird.map(coveragesWithSource, async (obj) => {
    const converter = v8ToIstanbul(obj.scriptPath);
    await converter.load();
    converter.applyCoverage(obj.script.functions);
    const coverage = converter.toIstanbul();
    const coveragePath = path.join(istanbulDir, obj.script.scriptId);
    fs.writeFileSync(`${coveragePath}.json`, JSON.stringify(coverage, null, 2));
  });

  // clean up
  await driver.deleteSession();
  t.pass();
});
