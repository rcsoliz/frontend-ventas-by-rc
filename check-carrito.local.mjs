import { chromium } from "playwright";

const shotsDir = "C:\\Users\\pc\\AppData\\Local\\Temp\\claude\\d--USFX-2025-Funde-8-SISTEMAS-DISTRIBUIDOS-Proyecto-VentasV1\\191eff8b-4e54-412b-97d4-ae29342a9c38\\scratchpad";

const browser = await chromium.launch();
const log = [];

async function run(width, height, tag) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("console", (msg) => log.push(`[console:${tag}] ${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => log.push(`[pageerror:${tag}] ${err.message}`));

  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shotsDir}\\login-${tag}.png` });

  try {
    await page.fill('input[name="username"]', "vendedor1");
    await page.fill('input[name="password"]', "Vendedor#2025");
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 8000 });
  } catch (e) {
    log.push(`[login-error:${tag}] ${e.message}`);
    await page.screenshot({ path: `${shotsDir}\\login-fail-${tag}.png` });
  }

  await page.goto("http://localhost:5173/ventas/nueva", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shotsDir}\\carrito-${tag}-initial.png`, fullPage: true });

  // Try the flow: empty submit first
  try {
    const confirmBtn = page.getByRole("button", { name: "Confirmar venta" });
    const isDisabled = await confirmBtn.isDisabled();
    log.push(`[${tag}] Confirmar venta disabled on empty state: ${isDisabled}`);
  } catch (e) {
    log.push(`[${tag}] error checking confirm button: ${e.message}`);
  }

  // Pick a client
  try {
    const clienteSelect = page.getByLabel("Cliente");
    await clienteSelect.selectOption({ index: 1 });
    log.push(`[${tag}] selected a client`);
  } catch (e) {
    log.push(`[${tag}] error selecting client: ${e.message}`);
  }

  // Pick a product and add it
  try {
    const productoSelect = page.getByLabel("Producto");
    await productoSelect.selectOption({ index: 1 });
    const cantidadInput = page.getByLabel("Cantidad");
    await cantidadInput.fill("2");
    await page.getByRole("button", { name: "Agregar" }).click();
    await page.waitForTimeout(300);
    log.push(`[${tag}] added product qty 2`);
    await page.screenshot({ path: `${shotsDir}\\carrito-${tag}-after-add.png`, fullPage: true });
  } catch (e) {
    log.push(`[${tag}] error adding product: ${e.message}`);
  }

  // Try adding the SAME product again (duplicate) to see dedupe/merge behavior
  try {
    const productoSelect = page.getByLabel("Producto");
    await productoSelect.selectOption({ index: 1 });
    const cantidadInput = page.getByLabel("Cantidad");
    await cantidadInput.fill("3");
    await page.getByRole("button", { name: "Agregar" }).click();
    await page.waitForTimeout(300);
    log.push(`[${tag}] added SAME product again qty 3 (expect merge to 5)`);
    await page.screenshot({ path: `${shotsDir}\\carrito-${tag}-after-duplicate.png`, fullPage: true });
  } catch (e) {
    log.push(`[${tag}] error adding duplicate: ${e.message}`);
  }

  // Try quantity 0 / negative
  try {
    const productoSelect = page.getByLabel("Producto");
    const optionsCount = await productoSelect.locator("option").count();
    if (optionsCount > 2) {
      await productoSelect.selectOption({ index: 2 });
      const cantidadInput = page.getByLabel("Cantidad");
      await cantidadInput.fill("0");
      await page.getByRole("button", { name: "Agregar" }).click();
      await page.waitForTimeout(300);
      log.push(`[${tag}] tried qty 0 on second product`);
      await page.screenshot({ path: `${shotsDir}\\carrito-${tag}-qty-zero.png`, fullPage: true });
    } else {
      log.push(`[${tag}] only one product available, skipped qty-0 test on 2nd product`);
    }
  } catch (e) {
    log.push(`[${tag}] error testing qty 0: ${e.message}`);
  }

  // Now try to confirm the sale (may succeed or fail depending on stock)
  try {
    const confirmBtn = page.getByRole("button", { name: "Confirmar venta" });
    await confirmBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${shotsDir}\\carrito-${tag}-after-confirm.png`, fullPage: true });
    log.push(`[${tag}] clicked confirmar venta`);
  } catch (e) {
    log.push(`[${tag}] error confirming: ${e.message}`);
  }

  await context.close();
}

await run(1280, 800, "desktop");
await run(375, 800, "mobile");

await browser.close();

console.log(log.join("\n"));
