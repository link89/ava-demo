import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import * as bluebird from "bluebird";
import * as https from 'https';
import axios from 'axios';

const v8ToIstanbul = require('v8-to-istanbul');  // FIXME

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
  const sourcesPath = path.join(cachePath, 'sources');  // folder to store .js & .js.map files
  fs.mkdirSync(sourcesPath);

  const covWithSources = await bluebird.map(
    v8Covs.filter(script => script.url.startsWith('http') && script.url.endsWith('.js')), async (script) => {
      // download source file
      const sourceFilePath = path.join(sourcesPath, pathFromUrl(script.url));
      fs.mkdirSync(path.dirname(sourceFilePath), { recursive: true });
      let res = await axios.get(script.url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
      const sourceMapFileName = res.data.match(/sourceMappingURL=(.+\.map)/)[1];
      const sourceMapFilePath = path.join(path.dirname(sourceFilePath), sourceMapFileName);
      fs.writeFileSync(sourceFilePath, res.data);

      // download source map file
      res = await axios.get(`${script.url}.map`, { transformResponse: [], httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
      fs.writeFileSync(sourceMapFilePath, res.data);

      return { script, sourceFilePath, sourceMapFilePath };
    }, { concurrency: 4, });

  // convert v8 coverage to istanbul
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

  await bluebird.map(covWithSources, async (obj) => {
    const converter = v8ToIstanbul(obj.sourceFilePath);
    await converter.load();
    converter.applyCoverage(obj.script.functions);
    const cov = converter.toIstanbul();
  }, { concurrency: 4, });

  // FIXME: v8-to-istanbul: source-mappings from one to many files not yet supported
}


const CACHE_PATH = process.argv[2];
const V8_COV_FILE = process.argv[3];

const usage = 'to-istanbul /path/to/cache v8-coverage-file'
assert(CACHE_PATH, usage);
assert(fs.existsSync(V8_COV_FILE), usage);