// Adds "Upload from device" buttons to the admin apps:
//  - writes webapp/ext/UploadCore.js and webapp/ext/Upload.js for each app
//  - adds the header button to the app's manifest.json
const fs = require('fs'), path = require('path');
const appDir = path.join(__dirname, '..', 'app');

const APPS = {
    animals: { fn: 'onUploadPhoto', id: 'uploadPhoto', text: 'Upload Photo', cfg: { mode: 'photo', entity: 'Animals', draft: true, action: 'setPhotoLink', kind: 'animal', accept: 'image/png,image/jpeg' } },
    shelters: { fn: 'onUploadImage', id: 'uploadImage', text: 'Upload Image', cfg: { mode: 'photo', entity: 'Shelters', draft: true, action: 'setImageLink', kind: 'shelter', accept: 'image/png,image/jpeg' } },
    adoptions: { fn: 'onUploadDoc', id: 'uploadDoc', text: 'Upload Document', cfg: { mode: 'document', entity: 'Adoptions', draft: false, action: 'addDocument', kind: 'document', accept: 'application/pdf,image/png,image/jpeg', docTypes: ['Agreement', 'Certificate', 'Supporting Document'] } },
    health: { fn: 'onUploadDoc', id: 'uploadDoc', text: 'Upload Document', cfg: { mode: 'document', entity: 'HealthRecords', draft: true, action: 'addDocument', kind: 'document', accept: 'application/pdf,image/png,image/jpeg', docTypes: ['Certificate', 'Medical Report', 'Lab Result'] } },
    inspections: { fn: 'onUploadDoc', id: 'uploadDoc', text: 'Upload Document', cfg: { mode: 'document', entity: 'Inspections', draft: true, action: 'addDocument', kind: 'document', accept: 'application/pdf,image/png,image/jpeg', docTypes: ['Inspection Report', 'Photo Evidence', 'Certificate'] } }
};
const core = fs.readFileSync(path.join(__dirname, 'UploadCore.template.js'), 'utf8');

for (const [app, a] of Object.entries(APPS)) {
    const web = path.join(appDir, app, 'webapp');
    const manifestFile = path.join(web, 'manifest.json');
    if (!fs.existsSync(manifestFile)) { console.log('missing app, skipped:', app); continue; }

    fs.mkdirSync(path.join(web, 'ext'), { recursive: true });
    fs.writeFileSync(path.join(web, 'ext', 'UploadCore.js'), core);
    fs.writeFileSync(path.join(web, 'ext', 'Upload.js'),
        `sap.ui.define(["aat/admin/${app}/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = ${JSON.stringify(a.cfg)};
  return {
    ${a.fn}: function () { Core.start(cfg); }
  };
});
`);

    let manifest;
    try { manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')); }
    catch (e) { console.log('SKIPPED (manifest is not valid JSON):', app, '-', e.message); continue; }
    const targets = (((manifest['sap.ui5'] || {}).routing || {}).targets) || {};
    let added = 0;
    for (const t of Object.values(targets)) {
        if (!/ObjectPage/.test(t.name || '')) continue;
        t.options = t.options || {}; t.options.settings = t.options.settings || {};
        const s = t.options.settings;
        s.content = s.content || {}; s.content.header = s.content.header || {}; s.content.header.actions = s.content.header.actions || {};
        s.content.header.actions[a.id] = { press: `aat.admin.${app}.ext.Upload.${a.fn}`, text: a.text, visible: true, enabled: true };
        added++;
    }
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`${app}: ext files written, button added to ${added} object page(s)`);
}