import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import * as bluebird from "bluebird";
import * as https from 'https';
import axios from 'axios';

const v8ToIstanbul = require('v8-to-istanbul');
const createSourceMapStore = require('istanbul-lib-source-maps').createSourceMapStore;
const libCoverage = require('istanbul-lib-coverage');

interface V8Coverage {
  url: string;
  functions: any[];
}

function pathFromUrl(url: string) {
  const u = new URL(url);
  return path.join(u.hostname, u.pathname)
}

async function toIstanbulCov(cachePath: string, outputPath: string, v8CovFile: string) {
  const v8Covs: V8Coverage[] = require(path.resolve(v8CovFile));  // load data
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  // download .js & .js.map
  const mapStore = createSourceMapStore();
  const sourcesPath = path.join(cachePath, 'sources');
  fs.mkdirSync(sourcesPath, { recursive: true });
  const covWithSources = await bluebird.map(
    v8Covs.filter(script => script.url.startsWith('http') && script.url.endsWith('.js')), async (script) => {
      // download source file
      const sourceFilePath = path.join(sourcesPath, pathFromUrl(script.url));
      const sourceMapFilePath = sourceFilePath + '.map';
      if (!fs.existsSync(sourceFilePath)) {
        fs.mkdirSync(path.dirname(sourceFilePath), { recursive: true });
        let res = await axios.get(script.url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
        fs.writeFileSync(sourceFilePath, res.data);
        res = await axios.get(script.url + '.map', { transformResponse: [], httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
        fs.writeFileSync(sourceMapFilePath, res.data);
      }
      mapStore.registerURL(sourceFilePath, path.basename(sourceMapFilePath));
      return { script, sourceFilePath, sourceMapFilePath };
    }, { concurrency: 4, });

  // convert v8 coverage to istanbul
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
  await bluebird.map(covWithSources, async (obj, i) => {
    const converter = v8ToIstanbul(obj.sourceFilePath);
    await converter.load();
    converter.applyCoverage(obj.script.functions);
    const cov = converter.toIstanbul();
    const rawIstanbulFilePath = path.join(outputPath, `${i}.raw.json`);
    fs.writeFileSync(rawIstanbulFilePath, JSON.stringify(cov, null, 2));
    const covMap = libCoverage.createCoverageMap(cov);
    const transformed = await mapStore.transformCoverage(covMap);
    const istanbulFilePath = path.join(outputPath, `${i}.json`);
    fs.writeFileSync(istanbulFilePath, JSON.stringify(transformed, null, 2));
  }, { concurrency: 4, });
}

function usage(message: string) {
  return message + '\n' + 'usage: to-istanbul /path/to/cache v8-coverage-file'
}

const CACHE_PATH = process.argv[2];
const OUTPUT_PATH = process.argv[3];
const V8_COV_FILE = process.argv[4];

assert(CACHE_PATH, usage('cache path is missing!'));
assert(OUTPUT_PATH, usage('output path is missing!'));
assert(fs.existsSync(V8_COV_FILE), usage('v8 coverage file is missing!'));

(async () => {
    try {
        await toIstanbulCov(CACHE_PATH, OUTPUT_PATH, V8_COV_FILE);
    } catch (err) {
        console.error(err);
    }
})();
