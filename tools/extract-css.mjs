// Ports the prototype's <style> block into the app's globals.css:
//  - swaps the embedded base64 fonts for static /fonts/*.woff2 URLs
//  - drops the prototype-only floating navigator styles (keeps .toast)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tpl = readFileSync(join(root, "mockups/index.template.html"), "utf8");

const start = tpl.indexOf("<style>") + "<style>".length;
const end = tpl.indexOf("</style>");
let css = tpl.slice(start, end);

// fonts → static files served from /public/fonts
css = css.replace(
  "src: url(data:font/woff2;base64,__FRAUNCES_B64__) format('woff2');",
  "src: url('/fonts/fraunces-latin.woff2') format('woff2');",
);
css = css.replace(
  "src: url(data:font/woff2;base64,__FIGTREE_B64__) format('woff2');",
  "src: url('/fonts/figtree-latin.woff2') format('woff2');",
);

// remove the prototype-only floating navigator (the app has real navigation)
const navStart = css.indexOf("/* ---------- PROTOTYPE NAVIGATOR ---------- */");
const navEnd = css.indexOf("/* toast */");
if (navStart !== -1 && navEnd !== -1) {
  css = css.slice(0, navStart) + css.slice(navEnd);
}

const header =
  "/* Hungry Panda design system — ported from the interactive prototype.\n" +
  "   Brand = bamboo green; chili-red & turmeric-amber are reserved as\n" +
  "   semantic allergen signals. Edit mockups/index.template.html + re-run\n" +
  "   `node tools/extract-css.mjs` to regenerate. */\n";

writeFileSync(join(root, "src/app/globals.css"), header + css);
console.log("Wrote src/app/globals.css (" + (header.length + css.length).toLocaleString() + " bytes)");
