import "dotenv/config";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import * as telegram from "./telegram";

function getOutputPath(date: Date): string {
  let outputPath = process.argv[1]
    .split("/")
    .filter((v) => !v.includes(".ts"))
    .filter((v) => v !== "src")
    .join("/");

  const timestamp = date.toISOString();
  return `${outputPath}/out/${timestamp}`;
}

function getVideoOutputPath(date: Date): string {
  return `${getOutputPath(date)}/videos`;
}

function getScreenshotOutputPath(date: Date, filename: string): string {
  return `${getOutputPath(date)}/screenshots/${filename}`;
}

async function main() {
  chromium.use(stealth());

  const browser = await chromium.launch();

  console.log("Starting context");

  await telegram.sendMessage(
    "🚨 There are citas! Go to the website now: https://icp.administracionelectronica.gob.es/icpplustieb/citar?p=8&locale=es"
  );

  return;

  const currentDate = new Date();

  // Create a new incognito browser context with a proper user agent
  const context = await browser.newContext({
    // userAgent:
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    recordVideo: {
      dir: `${getVideoOutputPath(currentDate)}`,
    },
  });

  //add init script
  await context.addInitScript(
    "Object.defineProperty(navigator, 'webdriver', {get: () => false})"
  );

  console.log("creating page");

  const page = await context.newPage();

  await page.goto(
    "https://icp.administracionelectronica.gob.es/icpplustieb/citar?p=8&locale=es"
  );

  console.log("opening up first page");

  await page.waitForTimeout(2000);

  await page.screenshot({
    path: getScreenshotOutputPath(currentDate, "office_selection_page.png"),
    fullPage: true,
  });

  console.log("Selecting fingerprints appointment");

  const processSelect = await page.locator(".mf-input__l");

  await processSelect.selectOption({ value: "4010" });

  await page.waitForTimeout(1500);

  await page.locator("#btnAceptar").click();

  console.log("Moving to clave button page");

  await page.waitForTimeout(3000);

  await page.screenshot({
    path: getScreenshotOutputPath(currentDate, "clave_button_selection.png"),
    fullPage: true,
  });

  await page.locator("#btnEntrar").click();

  console.log("Moving to NIE input page");

  await page.waitForTimeout(2000);

  // Now we fill out the form with our personal data
  // to look for available appointments

  await page.screenshot({
    path: getScreenshotOutputPath(currentDate, "nie_input_screen.png"),
    fullPage: true,
  });

  // Starting with the NIE
  await page.locator("#txtIdCitado").pressSequentially(process.env.NIE!);

  // Now the full name
  await page.locator("#txtDesCitado").pressSequentially(process.env.FULL_NAME!);

  // now the nationality (206 - Brasil)
  await page
    .locator("#txtPaisNac")
    .selectOption({ value: process.env.COUNTRY_CODE_FROM_SELECT! });

  await page.waitForTimeout(2000);

  await page.locator("#btnEnviar").click();

  console.log("Moving to select cita page");

  await page.waitForTimeout(2000);

  // Select "solicitar Cita"

  await page.screenshot({
    path: getScreenshotOutputPath(currentDate, "select_cita_page.png"),
    fullPage: true,
  });

  await page.locator("#btnEnviar").click();

  await page.waitForTimeout(2000);

  console.log("Checking for appointments");

  await page.screenshot({
    path: getScreenshotOutputPath(currentDate, "last_screen.png"),
    fullPage: true,
  });

  try {
    const noAppointments = await page.getByText(
      "En este momento no hay citas disponibles."
    );

    console.log("❌ Appointments still not available...");

    // Clicking on the exit button so the session gets cleaned up
    await page.locator("#btnSalir").click();
  } catch (e: unknown) {
    await page.screenshot({
      path: getScreenshotOutputPath(currentDate, "appointments_available.png"),
      fullPage: true,
    });
    console.log("✅ Appointments might be available!");
  }

  await context.close();
}

main().then(() => {
  console.log("done");
  process.exit(0);
});
