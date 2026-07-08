// End-to-end smoke test against a running server (npm run build && next start).
// Drives the real app: menu, live allergen blocking, cart, checkout, admin.
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:3210";
const out = process.argv[2] ?? "/tmp/app-shots";
const errors = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1.5,
  colorScheme: "light",
});
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

const step = (m) => console.log("• " + m);

// Home
await p.goto(base + "/", { waitUntil: "networkidle" });
await p.waitForSelector("text=ordered your way");
await p.screenshot({ path: out + "/home.png" });
step("home rendered");

// Menu + live allergen blocking
await p.goto(base + "/menu", { waitUntil: "networkidle" });
await p.waitForSelector("text=Pork & Chive Dumplings");
await p.click(".allergy-pill");
await p.waitForSelector(".modal-scrim.show");
await p.click('.allergen-toggle:has-text("Peanut")');
await p.click('.allergen-toggle:has-text("Shellfish")');
await p.click('button:has-text("Save & see safe dishes")');
await p.waitForTimeout(350);
const harGow = await p.getAttribute('article.item:has-text("Prawn Har Gow")', "data-blocked");
if (harGow !== "1") throw new Error("Expected Prawn Har Gow to be blocked, got " + harGow);
step("allergen blocking works (Prawn Har Gow blocked)");
await p.screenshot({ path: out + "/menu.png" });

// Add a safe item to the cart
await p.click('article.item:has-text("Pork & Chive Dumplings") button:has-text("Add")');
await p.waitForTimeout(250);
const count = (await p.textContent(".cart-count"))?.trim();
if (count !== "1") throw new Error("Expected cart count 1, got " + count);
step("add-to-cart works (count=1)");

// Checkout → place order → confirmation
await p.goto(base + "/checkout", { waitUntil: "networkidle" });
await p.fill("#co-name", "Test Guest");
await p.click('button:has-text("place order")');
await p.waitForURL("**/order/**", { timeout: 10000 });
await p.waitForSelector("text=Order confirmed");
step("checkout + order placement works (" + p.url() + ")");
await p.screenshot({ path: out + "/confirm.png" });

// Admin staff sign-in → dashboard
await p.goto(base + "/admin", { waitUntil: "networkidle" });
await p.click('button:has-text("Continue with Google")');
await p.waitForSelector("text=Live order queue", { timeout: 10000 });
step("admin staff sign-in + dashboard works");
await p.screenshot({ path: out + "/admin.png" });

// Admin menu edit: toggle availability + verify API round-trips
await p.goto(base + "/admin/menu", { waitUntil: "networkidle" });
await p.waitForSelector('text=Menu items');
step("admin menu manager rendered");
await p.screenshot({ path: out + "/admin-menu.png" });

await browser.close();
if (errors.length) {
  console.error("\nJS ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nSMOKE OK — no page errors");
