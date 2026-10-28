const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const apps = [
  "animals", "adoptions", "applications", "shelters",
  "health", "users", "auditlog", "inspections"
];

const resources = path.join(root, "resources");
fs.rmSync(resources, { recursive: true, force: true });
fs.mkdirSync(resources, { recursive: true });

for (const app of apps) {
  const zip = path.join(root, "app", app, `${app}.zip`);
  if (!fs.existsSync(zip)) {
    throw new Error(`Missing app ZIP: ${zip}. Build the UI5 module first.`);
  }
  fs.copyFileSync(zip, path.join(resources, `${app}.zip`));
}
console.log("Packaged all eight HTML5 application ZIPs.");
