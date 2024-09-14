import { chromium } from "@playwright/test";
import { test, expect } from "@playwright/test";

test("Check appointment availability", async ({ page }) => {
  await page.goto(
    "https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus"
  );

  const form = await page.locator("#formulario");
  await expect(form).toBeVisible();

  const submitInput = await form.locator('input[type="submit"]');
  await submitInput.scrollIntoViewIfNeeded();

  await page.waitForTimeout(3000);

  await submitInput.click();

  await page.waitForTimeout(3000);

  const provinceSelectionForm = await page.locator('form[action="index.html"]');
  await expect(provinceSelectionForm).toBeVisible();
});

// test("get started link", async ({ page }) => {
//   await page.goto("https://playwright.dev/");

//   // Click the get started link.
//   await page.getByRole("link", { name: "Get started" }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(
//     page.getByRole("heading", { name: "Installation" })
//   ).toBeVisible();
// });
