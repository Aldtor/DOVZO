import assert from "node:assert/strict";
import fs from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext();
const page = await context.newPage();
const base = process.env.AUDIT_URL || "http://localhost:3000";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.setDefaultTimeout(15000);
await fs.mkdir("/tmp/dovzo-design", { recursive: true });
async function open(path) {
  await page.goto(base + path);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some((el) =>
      Object.keys(el).some((k) => k.startsWith("__reactProps")),
    ),
  );
  await page.waitForTimeout(300);
}
try {
  await open("/");
  const homeCatalog = page.getByRole("region", { name: "All tools", exact: true });
  assert.equal(await homeCatalog.locator('a[href^="/tools/"]').count(), 50);
  await page.getByRole("textbox", { name: "Find a tool by name or task" }).fill("word counter");
  assert.equal(await homeCatalog.locator('a[href^="/tools/"]').count(), 1);
  await page.getByRole("textbox", { name: "Find a tool by name or task" }).fill("zz-no-match");
  await page.getByRole("heading", { name: "No matching tools" }).waitFor();
  await page.getByRole("button", { name: "Show all tools" }).click();
  await page.getByRole("button", { name: "PDF", exact: true }).click();
  assert.equal(await homeCatalog.locator('a[href^="/tools/"]').count(), 8);
  console.log("PASS homepage live search, category filter and empty-state recovery");
  await page.getByRole("button", { name: "Find a tool", exact: true }).click();
  const search = page.getByRole("combobox");
  await search.fill("pdf merger");
  await search.press("Enter");
  await page.waitForURL("**/tools/pdf-merger");
  await page.getByRole("heading", { name: "PDF Merger", exact: true, level: 1 }).waitFor();
  console.log("PASS homepage keyboard search");
  await open("/tools");
  await page.getByRole("button", { name: /^PDF\s+8$/ }).click();
  await page.getByRole("status").filter({ hasText: "Showing 8 of 50" }).waitFor();
  await page.getByRole("button", { name: "Add to favorites" }).first().click();
  await page.getByRole("button", { name: /^Favorites\s+1$/ }).click();
  await page.getByRole("status").filter({ hasText: "Showing 1 of 50" }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: /^Favorites\s+1$/ }).click();
  await page.getByRole("status").filter({ hasText: "Showing 1 of 50" }).waitFor();
  console.log("PASS category filtering and persistent favorites");
  await page.getByRole("button", { name: /^All tools\s+50$/ }).click();
  await page.getByRole("textbox", { name: "Filter tools" }).fill("zz-no-match");
  await page.getByRole("heading", { name: "No tools found" }).waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "List view" }).click();
  await page.getByLabel("Sort", { exact: true }).selectOption("az");
  await page.getByRole("status").filter({ hasText: "Showing 50 of 50" }).waitFor();
  console.log("PASS empty state, sorting and list view");
  for (const width of [390, 768, 1440])
    for (const route of [
      "/",
      "/tools",
      "/tools/pdf-merger",
      "/categories",
      "/categories/image",
      "/categories/pdf",
      "/categories/text",
      "/categories/developer",
      "/categories/generators",
      "/categories/file-media",
      "/search?q=pdf",
      "/popular",
      "/new",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/disclaimer",
      "/admin",
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await open(route);
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `Overflow ${route} at ${width}`,
      );
      assert.equal(await page.locator("main h1").count(), 1, `One page heading ${route}`);
      if (["/", "/tools", "/tools/pdf-merger", "/categories"].includes(route))
        await page.screenshot({
          path: `/tmp/dovzo-design/${route.replaceAll("/", "_") || "home"}-${width}.png`,
          fullPage: false,
        });
    }
  await page.setViewportSize({ width: 390, height: 844 });
  await open("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator("#mobile-navigation").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#mobile-navigation").count(), 0);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.waitForTimeout(400);
  assert(await page.locator("html").evaluate((el) => el.classList.contains("dark")));
  await page.screenshot({ path: "/tmp/dovzo-design/home-dark.png", fullPage: true });
  await page.reload();
  assert(await page.locator("html").evaluate((el) => el.classList.contains("dark")));
  console.log("PASS responsive layouts, mobile menu and theme persistence");
  assert.deepEqual(errors, []);
  console.log("PASS no page errors");
} finally {
  await browser.close();
}
