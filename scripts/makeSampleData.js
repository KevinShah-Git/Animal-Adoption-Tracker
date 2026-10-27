// Writes demo data for every table. Usage: node scripts/makeSampleData.js [target folder, default test/data]
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', process.argv[2] || 'test/data');
fs.mkdirSync(out, { recursive: true });

const id = (p, n) => `${p}-0000-0000-0000-${String(n).padStart(12, '0')}`;
const S = n => n === 1 ? '11111111-1111-1111-1111-111111111111' : n === 2 ? '22222222-2222-2222-2222-222222222222' : '33333333-3333-3333-3333-333333333333';
const A = n => id('aaaaaaaa', n), U = n => id('cccccccc', n), AP = n => id('dddddddd', n), H = n => id('bbbbbbbb', n);
const AD = n => id('99999999', n), IN = n => id('66666666', n);
const PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const IMG = s => `https://picsum.photos/seed/${s}/800/600`;
const ADMIN = 'admin@shelter.org';

const shelters = [
    { ID: S(1), shelterCode: 'SHL-0001', name: 'Happy Paws Shelter', address: '12 Lake Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', phone: '+91 80 4000 1111', email: 'hello@happypaws.org', capacity: 50, openingTime: '09:00:00', closingTime: '18:00:00', status: 'Active', imageUrl: IMG('happypaws') },
    { ID: S(2), shelterCode: 'SHL-0002', name: 'Furry Friends Haven', address: '45 Beach Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', phone: '+91 44 4000 2222', email: 'care@furryfriends.org', capacity: 30, openingTime: '10:00:00', closingTime: '17:00:00', status: 'Active', imageUrl: IMG('furryfriends') },
    { ID: S(3), shelterCode: 'SHL-0003', name: 'Hillside Rescue', address: '8 Hill View', city: 'Pune', state: 'Maharashtra', pincode: '411001', phone: '+91 20 4000 3333', email: 'info@hillside.org', capacity: 20, openingTime: '09:30:00', closingTime: '16:30:00', status: 'Inactive', imageUrl: IMG('hillside') }
];

const dog = n => `https://placedog.net/500/400?id=${n}`;
const cat = n => `https://loremflickr.com/500/400/cat?lock=${n}`;
const an = (n, shelter, name, species, breed, gender, age, color, arrival, health, vacc, status, fee, photo, desc, eligible) =>
    ({ ID: A(n), animalId: 'ANI-' + String(n).padStart(4, '0'), shelter_ID: S(shelter), name, species, breed, gender, age, color, arrivalDate: arrival, healthStatus: health, vaccinationStatus: vacc, adoptionStatus: status, adoptionFee: fee, photoUrl: photo, description: desc, adoptionEligible: eligible });
const animals = [
    an(1, 1, 'Bruno', 'Dog', 'Labrador', 'Male', 2, 'Golden', '2026-08-14', 'Healthy', 'Vaccinated', 'Available', 500, dog(1), 'Friendly and playful', true),
    an(2, 1, 'Luna', 'Dog', 'Indie', 'Female', 1.5, 'Brown', '2026-09-02', 'Healthy', 'Vaccinated', 'Available', 0, dog(2), 'Gentle and great with children', true),
    an(3, 2, 'Milo', 'Cat', 'Persian', 'Male', 1, 'White', '2026-09-10', 'Healthy', 'Vaccinated', 'Available', 300, cat(3), 'Calm lap cat', true),
    an(4, 2, 'Coco', 'Rabbit', 'Holland Lop', 'Female', 0.8, 'Grey', '2026-09-20', 'Healthy', 'Partially Vaccinated', 'Available', 150, 'https://loremflickr.com/500/400/rabbit?lock=4', 'Curious and soft', false),
    an(5, 1, 'Rocky', 'Dog', 'German Shepherd', 'Male', 4, 'Black and tan', '2026-10-01', 'Injured', 'Not Vaccinated', 'Under Treatment', 800, dog(5), 'Recovering from a leg injury', false),
    an(6, 2, 'Daisy', 'Cat', 'Indie', 'Female', 3, 'Tabby', '2026-07-21', 'Healthy', 'Vaccinated', 'Reserved', 0, cat(6), 'Reserved for a visiting family', true),
    an(7, 1, 'Max', 'Dog', 'Beagle', 'Male', 3, 'Tri-colour', '2026-06-18', 'Healthy', 'Vaccinated', 'Adopted', 400, dog(7), 'Adopted and loving it', true),
    an(8, 2, 'Simba', 'Cat', 'Indie', 'Male', 2, 'Ginger', '2026-06-30', 'Healthy', 'Vaccinated', 'Adopted', 0, cat(8), 'Adopted and settled in', true)
];

const us = (n, first, last, email, phone, address, city, state, pin, status) =>
    ({ ID: U(n), userId: 'USR-' + String(n).padStart(4, '0'), firstName: first, lastName: last, email, phone, address, city, state, pincode: pin, role: 'User', status });
const users = [
    us(1, 'KEVIN', 'SHAH', 'kevin@cap.com', '+91 98450 00001', '7 Palm Grove', 'Bengaluru', 'Karnataka', '560034', 'Active'),
    us(2, 'Riya', 'Shah', 'riya@gmail.com', '+91 98450 00002', '22 Green Park', 'Chennai', 'Tamil Nadu', '600020', 'Active'),
    us(3, 'Anokhi', "Shah", 'user@example.com', '+91 98450 00003', '5 Rose Lane', 'Pune', 'Maharashtra', '411004', 'Active'),
    us(4, 'Priya', 'Nair', 'priya@example.com', '+91 98450 00004', '31 Lotus Street', 'Kochi', 'Kerala', '682001', 'Inactive')
];

const ap = (n, animal, user, date, reason, housing, pets, exp, status, by, at, remarks, rej) =>
    ({ ID: AP(n), applicationNo: 'APP-' + String(n).padStart(5, '0'), animal_ID: A(animal), applicant_ID: U(user), applicationDate: date, reason, housingType: housing, hasOtherPets: pets, petExperience: exp, status, reviewedBy: by, reviewedAt: at, reviewerRemarks: remarks, rejectionReason: rej });
const applications = [
    ap(1, 1, 1, '2026-10-20', 'I have a big garden and have always wanted a Labrador', 'Independent House', false, 'Had dogs for 10 years', 'Submitted', '', '', '', ''),
    ap(2, 2, 2, '2026-10-18', 'Luna would be a wonderful companion for our two children', 'Apartment', true, 'Our family has a cat', 'Under Review', ADMIN, '2026-10-19T10:30:00Z', 'Home visit to be arranged', ''),
    ap(3, 7, 3, '2026-09-10', 'Looking for a jogging partner', 'Independent House', false, 'First-time owner, attended a training class', 'Approved', ADMIN, '2026-09-18T11:00:00Z', 'Good home, approved', ''),
    ap(4, 8, 1, '2026-08-05', 'Our home needs a cat to keep us company', 'Apartment', false, 'Grew up with cats', 'Approved', ADMIN, '2026-08-12T09:45:00Z', 'Great fit', ''),
    ap(5, 3, 2, '2026-10-05', 'I would love a calm cat', 'Apartment', true, '', 'Rejected', ADMIN, '2026-10-08T14:20:00Z', 'Please reapply after settling in', 'Existing pet not yet vaccinated'),
    ap(6, 6, 3, '2026-10-12', 'Daisy looks like the perfect fit for us', 'Independent House', false, '', 'Withdrawn', '', '', '', '')
];

let hn = 0;
const hi = (app, from, to, by, at, remarks) => ({ ID: id('eeeeeeee', ++hn), application_ID: AP(app), fromStatus: from, toStatus: to, changedBy: by, changedAt: at, remarks });
const history = [
    hi(1, '', 'Submitted', 'kevin@cap.com', '2026-10-20T09:00:00Z', ''),
    hi(2, '', 'Submitted', 'riya@gmail.com', '2026-10-18T16:10:00Z', ''),
    hi(2, 'Submitted', 'Under Review', ADMIN, '2026-10-19T10:30:00Z', 'Home visit to be arranged'),
    hi(3, '', 'Submitted', 'user@example.com', '2026-09-10T12:00:00Z', ''),
    hi(3, 'Submitted', 'Under Review', ADMIN, '2026-09-12T09:00:00Z', ''),
    hi(3, 'Under Review', 'Approved', ADMIN, '2026-09-18T11:00:00Z', 'Good home, approved'),
    hi(4, '', 'Submitted', 'kevin@cap.com', '2026-08-05T10:15:00Z', ''),
    hi(4, 'Submitted', 'Under Review', ADMIN, '2026-08-07T09:30:00Z', ''),
    hi(4, 'Under Review', 'Approved', ADMIN, '2026-08-12T09:45:00Z', 'Great fit'),
    hi(5, '', 'Submitted', 'riya@gmail.com', '2026-10-05T18:00:00Z', ''),
    hi(5, 'Submitted', 'Rejected', ADMIN, '2026-10-08T14:20:00Z', 'Existing pet not yet vaccinated'),
    hi(6, '', 'Submitted', 'user@example.com', '2026-10-12T08:40:00Z', ''),
    hi(6, 'Submitted', 'Withdrawn', 'user@example.com', '2026-10-14T19:05:00Z', '')
];

let dn = 0;
const doc = (prefix, fkName, parent, docType, fileName, isPdf, at, by) =>
    ({ ID: id(prefix, ++dn), [fkName]: parent, docType, fileName, mediaType: isPdf ? 'application/pdf' : 'image/jpeg', size: isPdf ? 245000 : 180000, url: isPdf ? PDF : IMG('doc' + dn), createdAt: at, createdBy: by });
const appDocs = [
    doc('ffffffff', 'application_ID', AP(1), 'Housing Proof', 'Rent agreement.pdf', true, '2026-10-20T09:05:00Z', 'kevin@cap.com'),
    doc('ffffffff', 'application_ID', AP(1), 'ID Proof', 'Aadhaar card.jpg', false, '2026-10-20T09:06:00Z', 'kevin@cap.com'),
    doc('ffffffff', 'application_ID', AP(2), 'Housing Proof', 'Sale deed.pdf', true, '2026-10-18T16:12:00Z', 'riya@gmail.com'),
    doc('ffffffff', 'application_ID', AP(3), 'ID Proof', 'Passport.jpg', false, '2026-09-10T12:05:00Z', 'user@example.com'),
    doc('ffffffff', 'application_ID', AP(3), 'Housing Proof', 'Property tax receipt.pdf', true, '2026-09-10T12:06:00Z', 'user@example.com'),
    doc('ffffffff', 'application_ID', AP(4), 'Housing Proof', 'Lease agreement.pdf', true, '2026-08-05T10:20:00Z', 'kevin@cap.com'),
    doc('ffffffff', 'application_ID', AP(5), 'ID Proof', 'Voter ID.jpg', false, '2026-10-05T18:05:00Z', 'riya@gmail.com')
];

const adoptions = [
    { ID: AD(1), adoptionNo: 'ADP-0001', application_ID: AP(3), animal_ID: A(7), adopter_ID: U(3), adoptionDate: '2026-09-20', status: 'Active', remarks: 'Adopted after a successful home check', createdAt: '2026-09-18T11:00:00Z', createdBy: ADMIN },
    { ID: AD(2), adoptionNo: 'ADP-0002', application_ID: AP(4), animal_ID: A(8), adopter_ID: U(1), adoptionDate: '2026-08-15', status: 'Completed', remarks: 'Settled in well', createdAt: '2026-08-12T09:45:00Z', createdBy: ADMIN }
];
dn = 0;
const adDocs = [
    doc('88888888', 'adoption_ID', AD(1), 'Agreement', 'Adoption agreement.pdf', true, '2026-09-20T10:00:00Z', ADMIN),
    doc('88888888', 'adoption_ID', AD(1), 'Certificate', 'Adoption certificate.pdf', true, '2026-09-20T10:05:00Z', ADMIN),
    doc('88888888', 'adoption_ID', AD(2), 'Agreement', 'Adoption agreement.pdf', true, '2026-08-15T10:00:00Z', ADMIN),
    doc('88888888', 'adoption_ID', AD(2), 'Certificate', 'Adoption certificate.pdf', true, '2026-08-15T10:05:00Z', ADMIN)
];

const hr = (n, animal, date, dx, tx, med, vet, w, health, vacc, summary, next, eligible, recovered) =>
    ({ ID: H(n), animal_ID: A(animal), checkupDate: date, diagnosis: dx, treatment: tx, medication: med, veterinarian: vet, weight: w, healthStatus: health, vaccinationStatus: vacc, healthSummary: summary, nextCheckupDate: next, adoptionEligible: eligible, recovered });
const health = [
    hr(1, 1, '2026-09-15', 'Routine checkup', 'None needed', '', 'Dr. Rao', 28.5, 'Healthy', 'Vaccinated', 'In excellent health', '2026-12-15', true, false),
    hr(2, 5, '2026-10-05', 'Fractured foreleg', 'Splint and rest', 'Painkillers', 'Dr. Rao', 31.2, 'Injured', 'Not Vaccinated', 'Healing well but not yet fit for adoption', '2026-10-12', false, false),
    hr(3, 4, '2026-09-22', 'Vaccination in progress', 'Second dose due', '', 'Dr. Mehta', 1.4, 'Healthy', 'Partially Vaccinated', 'Second vaccine dose is due', '2026-11-05', false, false),
    hr(4, 2, '2026-09-25', 'Routine checkup and deworming', 'Deworming tablet', 'Albendazole', 'Dr. Rao', 18.3, 'Healthy', 'Vaccinated', 'Healthy and active', '2026-12-25', true, false),
    hr(5, 3, '2026-10-01', 'Routine checkup', 'None needed', '', 'Dr. Mehta', 4.1, 'Healthy', 'Vaccinated', 'Healthy, calm temperament', '2026-11-20', true, false),
    hr(6, 6, '2026-09-10', 'Minor ear infection', 'Ear drops for 7 days', 'Otic drops', 'Dr. Mehta', 3.6, 'Healthy', 'Vaccinated', 'Fully recovered', '2026-12-10', true, true),
    hr(7, 7, '2026-09-12', 'Pre-adoption health check', 'None needed', '', 'Dr. Rao', 12.9, 'Healthy', 'Vaccinated', 'Fit for adoption', '2027-03-12', true, false),
    hr(8, 8, '2026-08-01', 'Pre-adoption health check', 'None needed', '', 'Dr. Mehta', 4.4, 'Healthy', 'Vaccinated', 'Fit for adoption', '2027-02-01', true, false)
];
dn = 0;
const hDocs = [
    doc('77777777', 'healthRecord_ID', H(1), 'Certificate', 'Vaccination certificate.pdf', true, '2026-09-15T11:00:00Z', ADMIN),
    doc('77777777', 'healthRecord_ID', H(2), 'Medical Report', 'X-ray report.pdf', true, '2026-10-05T12:00:00Z', ADMIN),
    doc('77777777', 'healthRecord_ID', H(4), 'Certificate', 'Health certificate.pdf', true, '2026-09-25T11:30:00Z', ADMIN),
    doc('77777777', 'healthRecord_ID', H(5), 'Certificate', 'Vaccination certificate.pdf', true, '2026-10-01T11:00:00Z', ADMIN),
    doc('77777777', 'healthRecord_ID', H(7), 'Certificate', 'Fitness certificate.pdf', true, '2026-09-12T10:30:00Z', ADMIN),
    doc('77777777', 'healthRecord_ID', H(8), 'Certificate', 'Fitness certificate.pdf', true, '2026-08-01T10:30:00Z', ADMIN)
];

const inspections = [
    { ID: IN(1), adoption_ID: AD(2), animal_ID: A(8), inspectionDate: '2026-09-10', inspector: 'Neha', inspectionType: 'Home Visit', existingPets: 0, animalCondition: 'Healthy and well settled', result: 'Validated', remarks: 'A great home' },
    { ID: IN(2), adoption_ID: AD(1), animal_ID: A(7), inspectionDate: '2026-10-05', inspector: 'Ravi', inspectionType: 'Phone Follow-up', existingPets: 0, animalCondition: 'Seems happy, no photo shared', result: 'Follow-up Required', remarks: 'Please share a recent photo of Max' },
    { ID: IN(3), adoption_ID: AD(1), animal_ID: A(7), inspectionDate: '2026-11-10', inspector: 'Neha', inspectionType: 'Home Visit', existingPets: 0, animalCondition: '', result: 'Scheduled', remarks: '' }
];
dn = 0;
const inDocs = [
    doc('55555555', 'inspection_ID', IN(1), 'Inspection Report', 'Home visit report.pdf', true, '2026-09-10T15:00:00Z', ADMIN),
    doc('55555555', 'inspection_ID', IN(1), 'Photo Evidence', 'Simba at home.jpg', false, '2026-09-10T15:10:00Z', ADMIN)
];

let an2 = 0;
const au = (entity, key, action, user, at, details) => ({ ID: id('44444444', ++an2), entity, entityKey: key, action, userId: user, timestamp: at, details });
const audit = [
    au('Animals', A(1), 'CREATE', ADMIN, '2026-08-14T09:00:00Z', 'Animal ANI-0001 added'),
    au('Animals', A(7), 'CREATE', ADMIN, '2026-06-18T09:00:00Z', 'Animal ANI-0007 added'),
    au('AdoptionApplications', AP(4), 'APPROVE', ADMIN, '2026-08-12T09:45:00Z', 'Application APP-00004 approved'),
    au('AdoptionApplications', AP(3), 'APPROVE', ADMIN, '2026-09-18T11:00:00Z', 'Application APP-00003 approved'),
    au('AdoptionApplications', AP(5), 'REJECT', ADMIN, '2026-10-08T14:20:00Z', 'Application APP-00005 rejected: existing pet not vaccinated'),
    au('Inspections', IN(1), 'RECORD_RESULT', ADMIN, '2026-09-10T15:20:00Z', 'Home visit validated'),
    au('HealthRecords', H(2), 'CREATE', ADMIN, '2026-10-05T12:05:00Z', 'Health record added for Rocky'),
    au('Shelters', S(3), 'UPDATE', ADMIN, '2026-10-01T10:00:00Z', 'Shelter set to Inactive')
];

const files = {
    Shelters: shelters, Animals: animals, Users: users, AdoptionApplications: applications, ApplicationHistory: history,
    ApplicationDocuments: appDocs, Adoptions: adoptions, AdoptionDocuments: adDocs, HealthRecords: health, HealthDocuments: hDocs,
    Inspections: inspections, InspectionDocuments: inDocs, AuditLog: audit
};

const cell = v => { if (v === null || v === undefined) return ''; const s = String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
for (const [name, rows] of Object.entries(files)) {
    const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
    fs.writeFileSync(path.join(out, `aat-${name}.csv`), [cols.join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\n') + '\n');
}
console.log(`Wrote ${Object.keys(files).length} files to ${path.relative(process.cwd(), out) || '.'}`);