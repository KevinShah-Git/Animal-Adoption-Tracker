// Removes the old "Upload ..." buttons from every app manifest.
const fs = require('fs'), path = require('path');
const appDir = path.join(__dirname, '..', 'app');
let files = 0, removed = 0;

function clean(node) {                       // returns true when something was removed below this node
    let touched = false;
    for (const key of Object.keys(node)) {
        const v = node[key];
        if (v && typeof v === 'object') {
            if (typeof v.press === 'string' && v.press.includes('ext.Upload')) { delete node[key]; removed++; touched = true; continue; }
            if (clean(v)) {
                touched = true;
                if (!Array.isArray(v) && Object.keys(v).length === 0) delete node[key];   // drop containers that became empty
            }
        }
    }
    return touched;
}

for (const d of fs.readdirSync(appDir)) {
    const f = path.join(appDir, d, 'webapp', 'manifest.json');
    if (!fs.existsSync(f)) continue;
    let json;
    try { json = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { console.log('SKIPPED (not valid JSON, check commas and braces):', path.join(d, 'webapp', 'manifest.json'), '-', e.message); continue; }
    if (clean(json)) { fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n'); files++; console.log('cleaned', path.join(d, 'webapp', 'manifest.json')); }
}
console.log(`Done. Removed ${removed} upload button(s) from ${files} file(s).`);