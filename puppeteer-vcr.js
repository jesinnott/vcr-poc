// https://github.com/gadget-inc/puppeteer-vcr
import path from "path";
import puppeteer from "puppeteer";
import { VCR } from "puppeteer-vcr";

let browser;

(async () => {
  try {
    browser = await puppeteer.launch({ headless: false });
    const recorderPage = await browser.newPage();

    const cassetteRoot = path.join(__dirname, "tapes");

    // RECORD

    const recorder = new VCR({
      cassetteRoot: cassetteRoot,
      mode: "record-only",
    });

    await recorder.apply("Test Namespace", recorderPage);

    await recorderPage.goto("https://www.youtube.com/", {
      waitUntil: ["load", "networkidle2"],
    });

    await recorder.drainTasks();
    await delay(5000);
    await recorderPage.close();

    // REPLAY

    const replayPage = await browser.newPage();

    const replayer = new VCR({
      cassetteRoot: cassetteRoot,
      mode: "replay-only",
    });

    await replayer.apply("Test Namespace", replayPage);

    await replayPage.goto("https://www.youtube.com/", {
      waitUntil: ["load", "networkidle2"],
    });

    await replayer.drainTasks();
    await replayPage.close();

    await delay(5000);
  } catch (error) {
    console.log(`catch >>> ${error}`);
    throw new Error(error);
  } finally {
    if (browser) await browser.close();
  }
})();

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};
