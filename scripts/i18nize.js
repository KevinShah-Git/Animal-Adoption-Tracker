// Turns every English label in app/admin/*.cds into an i18n key and writes English + Hindi bundles.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'app', 'admin');

const HI = {
    'Animal ID': 'जानवर आईडी', 'Name': 'नाम', 'Species': 'प्रजाति', 'Breed': 'नस्ल', 'Gender': 'लिंग', 'Age (years)': 'आयु (वर्ष)',
    'Colour': 'रंग', 'Arrival Date': 'आगमन की तारीख', 'Shelter': 'शेल्टर', 'Health Status': 'स्वास्थ्य स्थिति',
    'Vaccination Status': 'टीकाकरण स्थिति', 'Adoption Status': 'गोद लेने की स्थिति', 'Adoption Fee (₹)': 'गोद लेने का शुल्क (₹)',
    'Eligible for Adoption': 'गोद लेने के योग्य', 'Description': 'विवरण', 'Photo': 'फ़ोटो', 'Photo link (URL)': 'फ़ोटो लिंक (URL)',
    'Shelter ID': 'शेल्टर आईडी', 'Shelter Name': 'शेल्टर का नाम', 'Address': 'पता', 'City': 'शहर', 'State': 'राज्य', 'Pincode': 'पिनकोड',
    'Phone': 'फ़ोन', 'Email': 'ईमेल', 'Capacity': 'क्षमता', 'Status': 'स्थिति', 'Opening Time': 'खुलने का समय', 'Closing Time': 'बंद होने का समय',
    'Current Occupancy': 'वर्तमान भराव', 'Occupancy %': 'भराव %', 'Image link (URL)': 'छवि लिंक (URL)', 'Occupancy': 'भराव',
    'Application ID': 'आवेदन आईडी', 'Applicant': 'आवेदक', 'Applied On': 'आवेदन की तारीख', 'Reason for Adoption': 'गोद लेने का कारण',
    'Housing Type': 'आवास का प्रकार', 'Has Other Pets': 'अन्य पालतू जानवर हैं', 'Pet Experience': 'पालतू जानवर रखने का अनुभव',
    'Reviewed By': 'समीक्षक', 'Reviewed At': 'समीक्षा का समय', 'Reviewer Remarks': 'समीक्षक की टिप्पणी', 'Rejection Reason': 'अस्वीकृति का कारण',
    'Changed At': 'बदलाव का समय', 'From': 'से', 'To': 'तक', 'Changed By': 'बदलाव करने वाला', 'Remarks': 'टिप्पणी',
    'Adoption ID': 'गोद लेने की आईडी', 'Adopter': 'गोद लेने वाला', 'Adoption Date': 'गोद लेने की तारीख', 'Animal': 'जानवर',
    'Checkup Date': 'जाँच की तारीख', 'Diagnosis': 'निदान', 'Treatment': 'इलाज', 'Medication': 'दवा', 'Veterinarian': 'पशु चिकित्सक',
    'Weight (kg)': 'वज़न (कि.ग्रा.)', 'Health Summary': 'स्वास्थ्य सारांश', 'Next Checkup': 'अगली जाँच', 'Recovered': 'ठीक हो गया',
    'Inspection Date': 'निरीक्षण की तारीख', 'Inspector': 'निरीक्षक', 'Type': 'प्रकार', 'Existing Pets': 'मौजूदा पालतू जानवर',
    'Animal Condition': 'जानवर की हालत', 'Result': 'परिणाम', 'Document Type': 'दस्तावेज़ का प्रकार', 'File Name': 'फ़ाइल का नाम',
    'Size (bytes)': 'आकार (बाइट)', 'Uploaded On': 'जोड़ने की तारीख', 'User ID': 'उपयोगकर्ता आईडी', 'First Name': 'पहला नाम',
    'Last Name': 'अंतिम नाम', 'Role': 'भूमिका', 'Entity': 'इकाई', 'Record Key': 'रिकॉर्ड कुंजी', 'Action': 'कार्रवाई', 'User': 'उपयोगकर्ता',
    'When': 'कब', 'Details': 'विवरण',
    'General': 'सामान्य', 'Health & Adoption': 'स्वास्थ्य और गोद लेना', 'Health History': 'स्वास्थ्य इतिहास', 'Housing': 'आवास',
    'Staff Remarks': 'स्टाफ की टिप्पणी', 'Documents': 'दस्तावेज़', 'Review History': 'समीक्षा इतिहास', 'Checkup': 'जाँच',
    'Adoption': 'गोद लेना', 'Inspections': 'निरीक्षण', 'Inspection': 'निरीक्षण', 'Profile': 'प्रोफ़ाइल', 'Access': 'पहुँच',
    'Animals': 'जानवर', 'Application': 'आवेदन', 'Applications': 'आवेदन', 'Shelters': 'शेल्टर', 'Health Record': 'स्वास्थ्य रिकॉर्ड',
    'Health Records': 'स्वास्थ्य रिकॉर्ड', 'Adoptions': 'गोद लेना', 'Users': 'उपयोगकर्ता', 'Audit Entry': 'ऑडिट प्रविष्टि', 'Audit Log': 'ऑडिट लॉग',
    'Change Adoption Status': 'गोद लेने की स्थिति बदलें', 'Start Review': 'समीक्षा शुरू करें', 'Approve': 'स्वीकृत करें',
    'Reject': 'अस्वीकृत करें', 'Schedule Checkup': 'जाँच निर्धारित करें', 'Mark Recovered': 'ठीक हुआ चिह्नित करें',
    'Schedule Inspection': 'निरीक्षण निर्धारित करें', 'Record Result': 'परिणाम दर्ज करें', 'Add Document': 'दस्तावेज़ जोड़ें',
    'Remove': 'हटाएँ', 'Set Photo Link': 'फ़ोटो लिंक सेट करें', 'Set Image Link': 'छवि लिंक सेट करें',
    'ID': 'आईडी', 'File': 'फ़ाइल', 'Link': 'लिंक', 'Document Link': 'दस्तावेज़ लिंक', 'Created At': 'बनाया गया (समय)', 'Created By': 'बनाने वाला', 'Modified At': 'बदला गया (समय)', 'Modified By': 'बदलने वाला', 'Administrative': 'प्रशासनिक',
    'Set Photo Link': 'फ़ोटो लिंक सेट करें', 'Set Image Link': 'छवि लिंक सेट करें',
};

const keyFor = new Map(), textFor = new Map();
const props = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')) : [];
for (const l of props(path.join(dir, '_i18n', 'i18n.properties'))) {
    const i = l.indexOf('='); textFor.set(l.slice(0, i), l.slice(i + 1)); keyFor.set(l.slice(i + 1), l.slice(0, i));
}
const slug = t => {
    const words = t.replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
    return words.map((w, i) => i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join('') || 'text';
};
const keyOf = t => {
    if (keyFor.has(t)) return keyFor.get(t);
    let k = slug(t), n = 2, base = k;
    while (textFor.has(k) && textFor.get(k) !== t) k = base + n++;
    keyFor.set(t, k); textFor.set(k, t); return k;
};

const re = /(@title\s*:\s*|\b(?:Label|TypeName|TypeNamePlural)\s*:\s*)'((?:[^'\\]|\\.)*)'/g;
let changed = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.cds'))) {
    const file = path.join(dir, f);
    const src = fs.readFileSync(file, 'utf8');
    const out = src.replace(re, (m, pre, text) => {
        if (text.startsWith('{i18n>') || !/[A-Za-z]/.test(text)) return m;
        changed++; return `${pre}'{i18n>${keyOf(text)}}'`;
    });
    if (out !== src) fs.writeFileSync(file, out);
}

const en = [...textFor].map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
const hi = [...textFor].map(([k, v]) => `${k}=${HI[v] || v}`).join('\n') + '\n';
const missing = [...textFor.values()].filter(v => !HI[v]);
for (const d of [path.join(dir, '_i18n'), path.join(root, '_i18n')]) {
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'i18n.properties'), en);
    fs.writeFileSync(path.join(d, 'i18n_hi.properties'), hi);
}
console.log(`Converted ${changed} labels, ${textFor.size} keys in total.`);
if (missing.length) console.log('No Hindi text yet for:', missing.join(' | '));