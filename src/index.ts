import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();

  console.log("Starting context");

  const videoPath = process.argv[1]
    .split("/")
    .filter((v) => !v.includes(".ts"))
    .join("/");

  console.log("video path: ", videoPath);

  // Create a new incognito browser context with a proper user agent
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    recordVideo: {
      dir: `${videoPath}/videos`,
    },
  });

  //add init script
  await context.addInitScript(
    "Object.defineProperty(navigator, 'webdriver', {get: () => false})"
  );

  console.log("creating page");

  const page = await context.newPage();

  await page.goto(
    "https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus"
  );

  console.log("form lookup");
  const form = await page.locator("#formulario");

  const submitInput = await form.locator('input[type="submit"]');
  await submitInput.scrollIntoViewIfNeeded();

  const cookies = await context.cookies();

  console.log("Cookies so far: ", cookies);

  await page.waitForTimeout(3000);

  console.log("form click");

  await submitInput.click();

  await page.waitForTimeout(3000);

  console.log("screenshot");

  await page.screenshot({ path: "from_source.png" });

  await context.close();
}

main().then(() => {
  console.log("done");
  process.exit(0);
});
