require("dotenv").config();
import path from "path";
import puppeteer from "puppeteer";
import * as vcr from "/src/utils/vcr";

const delay = async (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const redirectToYoutube = async (page) => {
  const linkHandlers = await page.$x(
    '//a[contains(text(), "Navigate to Youtube")]'
  );

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error("Link not found");
  }
};

const getPodcastChannels = async (page) => {
  const channelNames = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll("h2"),
      (element) => element.textContent
    )
  );

  if (channelNames.length > 0) {
    channelNames.forEach((name) => {
      console.log(`Channel Name: ${name}`);
    });
  } else {
    console.log("Where are the channels? =(");
  }
};

const takeScreenshot = async (page, screenshotName) => {
  await page.screenshot({
    path: path.join(__dirname, `screenshots/${screenshotName}`),
    // Todo: Check error in VCR library when saving fullpage screenshot!!!
    // fullPage: true,
  });
};

const runScraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const mainPage = await browser.newPage();

  const commitVcr = await vcr.start("what-the-commit", mainPage);
  await mainPage.goto("http://whatthecommit.com/", {
    waitUntil: ["load", "networkidle2"],
  });
  await takeScreenshot(mainPage, "what-the-commit.png");

  await vcr.stop(commitVcr);
  await delay(5000);

  browser.close();
};

runScraper();
