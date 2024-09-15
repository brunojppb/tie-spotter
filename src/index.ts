import "dotenv/config";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

async function main() {
  chromium.use(stealth());

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
    "https://icp.administracionelectronica.gob.es/icpplustieb/citar?p=8&locale=es"
  );

  console.log("opening up first page");

  await page.waitForTimeout(2000);

  await page.screenshot({
    path: "./src/screenshots/office_selection_page.png",
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
    path: "./src/screenshots/clave_button_selection.png",
    fullPage: true,
  });

  await page.locator("#btnEntrar").click();

  console.log("Moving to NIE input page");

  await page.waitForTimeout(2000);

  // Now we fill out the form with our personal data
  // to look for available appointments

  await page.screenshot({
    path: "./src/screenshots/nie_input_screen.png",
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
    path: "./src/screenshots/select_cita_page.png",
    fullPage: true,
  });

  await page.locator("#btnEnviar").click();

  await page.waitForTimeout(2000);

  console.log("Checking for appointments");

  await page.screenshot({
    path: "./src/screenshots/last_screen.png",
    fullPage: true,
  });

  try {
    const noAppointments = await page.getByText(
      "En este momento no hay citas disponibles."
    );

    console.log("❌ Appointments still not available...");
  } catch (e: unknown) {
    console.log("✅ Appointments might be available!");
    // TODO: Notify Bruno!!!!!!!!
  }

  await page.waitForTimeout(2000);

  await context.close();
}

main().then(() => {
  console.log("done");
  process.exit(0);
});
