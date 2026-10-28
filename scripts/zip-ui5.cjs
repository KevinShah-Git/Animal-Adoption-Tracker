const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const app = process.argv[2];
if (!app) throw new Error("Usage: node scripts/zip-ui5.cjs <app-name>");

const dist = path.join(process.cwd(), "dist");
const output = path.join(process.cwd(), `${app}.zip`);

if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error(`Missing built app: ${dist}/index.html`);
}

if (fs.existsSync(output)) fs.unlinkSync(output);

execFileSync("zip", ["-qr", output, "."], { cwd: dist, stdio: "inherit" });
console.log(`Created ${output}`);
