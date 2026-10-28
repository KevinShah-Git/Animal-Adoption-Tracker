// Removes the "Set Photo Link", "Set Image Link" and "Add Document" buttons from the admin screens.
// (The actions themselves stay: the Upload buttons use them behind the scenes.)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'app', 'admin');
const OBJECT = /\{(?:[^{}'"]|'[^']*'|"[^"]*")*\}/g;                 // one { ... } item, braces inside quotes are fine
const TARGET = /Action\s*:\s*'AdminService\.(?:addDocument|setPhotoLink|setImageLink)'/;
let total = 0;

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.cds'))) {
    const file = path.join(dir, f);
    let src = fs.readFileSync(file, 'utf8'), removed = 0;
    const hits = [...src.matchAll(OBJECT)].filter(m => TARGET.test(m[0])).map(m => ({ start: m.index, end: m.index + m[0].length }));
    for (const h of hits.reverse()) {                                  // from the end, so positions stay valid
        let { start, end } = h;
        const after = /^\s*,/.exec(src.slice(end));
        if (after) end += after[0].length;                               // item followed by a comma -> remove the comma too
        else { const before = /,\s*$/.exec(src.slice(0, start)); if (before) start -= before[0].length; }   // last item -> remove the comma before it
        src = src.slice(0, start) + src.slice(end);
        removed++;
    }
    if (removed) { fs.writeFileSync(file, src); console.log(`${f}: removed ${removed} button(s)`); total += removed; }
}
console.log(total ? `Done, ${total} button(s) removed.` : 'Nothing to remove (already clean).');