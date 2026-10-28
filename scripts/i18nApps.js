// Creates webapp/i18n/i18n_hi.properties for every admin app (tile / app titles in Hindi).
const fs = require('fs'), path = require('path');
const appDir = path.join(__dirname, '..', 'app');
const HI = {
    'Animals': 'जानवर', 'Adoption Applications': 'गोद लेने के आवेदन', 'Shelters': 'शेल्टर', 'Health Records': 'स्वास्थ्य रिकॉर्ड',
    'Adoptions': 'गोद लेना', 'Inspections': 'निरीक्षण', 'Users': 'उपयोगकर्ता', 'Audit Log': 'ऑडिट लॉग', 'Admin': 'एडमिन',
    'Manage animals in shelters': 'शेल्टर में जानवरों का प्रबंधन', 'Review adoption applications': 'गोद लेने के आवेदनों की समीक्षा',
    'Manage shelters and capacity': 'शेल्टर और क्षमता का प्रबंधन', 'Track animal health records': 'जानवरों के स्वास्थ्य रिकॉर्ड ट्रैक करें',
    'View adoptions and inspections': 'गोद लेना और निरीक्षण देखें', 'Manage post-adoption inspections': 'गोद लेने के बाद के निरीक्षणों का प्रबंधन',
    'Manage user accounts': 'उपयोगकर्ता खातों का प्रबंधन', 'View the system audit trail': 'सिस्टम ऑडिट ट्रेल देखें'
};
let n = 0;
for (const d of fs.readdirSync(appDir)) {
    const dir = path.join(appDir, d, 'webapp', 'i18n');
    const en = path.join(dir, 'i18n.properties');
    if (!fs.existsSync(en)) continue;
    const lines = fs.readFileSync(en, 'utf8').split(/\r?\n/).map(l => {
        const i = l.indexOf('=');
        if (i < 0 || l.trim().startsWith('#')) return l;
        const v = l.slice(i + 1).trim();
        return l.slice(0, i + 1) + (HI[v] || v);
    });
    fs.writeFileSync(path.join(dir, 'i18n_hi.properties'), lines.join('\n'));
    n++; console.log('Hindi titles written for', d);
}
console.log(n ? `Done (${n} apps).` : 'No app i18n folders found.');