import path from "path";
import { VCR } from "puppeteer-vcr";
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const cassetteRoot = path.join(__dirname, "..", "..", "tmp","tapes");
const s3Root = "s3://bucket-vcr-test/tapes";

const start = async (namespace, page) => {
  const vcrMode = process.env.VCR_MODE || "record-only";

  if (process.env.VCR_MODE === "off") return;
  if (process.env.VCR_MODE === "replay-only") await cassetteSync(`${s3Root} ${cassetteRoot}`);

  const vcr = new VCR({
    cassetteRoot: cassetteRoot,
    mode: vcrMode,
  });

  await vcr.apply(namespace, page);

  return vcr;
};

const stop = async (vcr) => {
  if (process.env.VCR_MODE === "off") return;
  await vcr.drainTasks();

  if (process.env.VCR_MODE === "record-only") await cassetteSync(`${cassetteRoot} ${s3Root}`);
};

const cassetteSync = (fromToPath) => {
  const comman = `aws s3 cp ${fromToPath} --recursive`;

  console.log('Starting Sync...');
  return new Promise((resolve, reject) => {
    exec(comman)
    .then(() => resolve(console.log('Cassette coppied successfully...')))
    .catch((err) => reject(console.log(err)));
  });
}

export { start, stop };
