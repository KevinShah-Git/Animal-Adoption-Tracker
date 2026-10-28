const cl = require('./lib/cloudinary');
const cds = require('@sap/cds');
const { nextNumber, audit, addHistory } = require('./lib/common');

module.exports = class AdminService extends cds.ApplicationService {
  async init() {
    const db = cds.entities('aat');
    const { Shelters, Animals, AdoptionApplications, Adoptions, HealthRecords, Inspections } = db;
    const idOf = p => (typeof p === 'object' ? p.ID : p);

    // ========== SHELTERS ==========
    this.before('CREATE', 'Shelters', async req => {
      req.data.shelterCode = await nextNumber('Shelters', 'shelterCode', 'SHL');
      if (req.data.capacity != null && req.data.capacity < 1) req.error(400, 'Capacity must be at least 1');
    });
    this.after('READ', 'Shelters', async rows => {            // FR-ADM-022
      const list = Array.isArray(rows) ? rows : [rows];
      for (const s of list.filter(x => x?.ID)) {
        const [{ n }] = await SELECT.from(Animals).columns('count(*) as n')
          .where({ shelter_ID: s.ID, adoptionStatus: { '!=': 'Adopted' } });
        s.currentOccupancy = n;
        s.occupancyPct = s.capacity ? +((n / s.capacity) * 100).toFixed(2) : 0;
      }
    });

    // ========== ANIMALS ==========
    this.before(['CREATE', 'UPDATE'], 'Animals', async req => {
      const d = req.data;
      if (d.adoptionFee != null && d.adoptionFee < 0) req.error(400, 'Adoption fee cannot be negative', 'adoptionFee');
      if (d.age != null && d.age < 0) req.error(400, 'Age cannot be negative', 'age');
      if (d.shelter_ID) {                                    // FR-ADM-002
        const sh = await SELECT.one.from(Shelters).where({ ID: d.shelter_ID });
        if (!sh) return req.error(400, 'Shelter does not exist', 'shelter_ID');
        if (sh.status !== 'Active') req.error(400, 'Shelter is inactive', 'shelter_ID');
        const [{ n }] = await SELECT.from(Animals).columns('count(*) as n')
          .where({ shelter_ID: d.shelter_ID, adoptionStatus: { '!=': 'Adopted' }, ID: { '!=': d.ID || '' } });
        if (n >= sh.capacity) req.error(409, `Shelter is full (${n}/${sh.capacity})`, 'shelter_ID');
      }
      if (d.healthStatus || d.vaccinationStatus) {           // FR-ADM-016
        d.adoptionEligible = d.healthStatus === 'Healthy' && d.vaccinationStatus === 'Vaccinated';
      }
    });
    this.before('CREATE', 'Animals', async req => {
      req.data.animalId = await nextNumber('Animals', 'animalId', 'ANI');
      req.data.arrivalDate ??= new Date().toISOString().slice(0, 10);
    });
    this.on('changeAdoptionStatus', 'Animals', async req => {   // FR-ADM-004
      const ID = idOf(req.params[0]);
      const { status } = req.data;
      if (!['Available', 'Reserved', 'Adopted', 'Under Treatment'].includes(status))
        return req.error(400, 'Invalid adoption status');
      await UPDATE(Animals).set({ adoptionStatus: status }).where({ ID });
      await audit('Animals', ID, 'STATUS_CHANGE', req.user, { status });
      return SELECT.one.from(Animals).where({ ID });
    });

    // ========== APPLICATIONS ==========
    this.on('startReview', 'AdoptionApplications', async req => {
      const ID = idOf(req.params[0]);
      const app = await SELECT.one.from(AdoptionApplications).where({ ID });
      if (app.status !== 'Submitted') return req.error(409, 'Only submitted applications can be moved to review');
      await UPDATE(AdoptionApplications).set({ status: 'Under Review', reviewedBy: req.user.id }).where({ ID });
      await audit('AdoptionApplications', ID, 'START_REVIEW', req.user);
      await addHistory(ID, app.status, 'Under Review', req.user);
      return SELECT.one.from(AdoptionApplications).where({ ID });
    });

    this.on('approve', 'AdoptionApplications', async req => {     // FR-ADM-008 + FR-ADM-010
      const ID = idOf(req.params[0]);
      const app = await SELECT.one.from(AdoptionApplications).where({ ID });
      if (!['Submitted', 'Under Review'].includes(app.status))
        return req.error(409, `Cannot approve an application in status ${app.status}`);
      const animal = await SELECT.one.from(Animals).where({ ID: app.animal_ID });
      if (!['Available', 'Reserved'].includes(animal.adoptionStatus))
        return req.error(409, 'Animal is no longer available for adoption');
      if (!animal.adoptionEligible)
        return req.error(409, 'Animal is not yet health-eligible for adoption');

      const now = new Date().toISOString();
      await UPDATE(AdoptionApplications).set({
        status: 'Approved', reviewedBy: req.user.id, reviewedAt: now, reviewerRemarks: req.data.remarks
      }).where({ ID });
      await addHistory(ID, app.status, 'Approved', req.user, req.data.remarks);

      // system-generated adoption record
      await INSERT.into(Adoptions).entries({
        adoptionNo: await nextNumber('Adoptions', 'adoptionNo', 'ADP'),
        application_ID: ID, animal_ID: app.animal_ID, adopter_ID: app.applicant_ID,
        adoptionDate: now.slice(0, 10), status: 'Active'
      });
      await UPDATE(Animals).set({ adoptionStatus: 'Adopted' }).where({ ID: app.animal_ID });

      // auto-reject other open applications for the same animal
      const others = await SELECT.from(AdoptionApplications).where({
        animal_ID: app.animal_ID, ID: { '!=': ID }, status: { in: ['Submitted', 'Under Review'] }
      });
      for (const o of others) {
        await UPDATE(AdoptionApplications).set({
          status: 'Rejected', rejectionReason: 'Animal adopted by another applicant'
        }).where({ ID: o.ID });
        await addHistory(o.ID, o.status, 'Rejected', req.user, 'Animal adopted by another applicant');
      }
      await audit('AdoptionApplications', ID, 'APPROVE', req.user, req.data);
      return SELECT.one.from(AdoptionApplications).where({ ID });
    });

    this.on('reject', 'AdoptionApplications', async req => {
      const ID = idOf(req.params[0]);
      const { reason, remarks } = req.data;
      if (!reason) return req.error(400, 'Rejection reason is mandatory');
      const app = await SELECT.one.from(AdoptionApplications).where({ ID });
      if (!['Submitted', 'Under Review'].includes(app.status))
        return req.error(409, `Cannot reject an application in status ${app.status}`);
      await UPDATE(AdoptionApplications).set({
        status: 'Rejected', reviewedBy: req.user.id, reviewedAt: new Date().toISOString(),
        rejectionReason: reason, reviewerRemarks: remarks
      }).where({ ID });
      await addHistory(ID, app.status, 'Rejected', req.user, reason);
      await audit('AdoptionApplications', ID, 'REJECT', req.user, req.data);
      return SELECT.one.from(AdoptionApplications).where({ ID });
    });

    // ========== HEALTH RECORDS ==========
    this.before(['CREATE', 'UPDATE'], 'HealthRecords', req => {
      const d = req.data;
      if (d.weight != null && d.weight <= 0) req.error(400, 'Weight must be positive', 'weight');
      if (d.nextCheckupDate && d.checkupDate && d.nextCheckupDate < d.checkupDate)
        req.error(400, 'Next checkup cannot be before the checkup date', 'nextCheckupDate');
    });
    this.after(['CREATE', 'UPDATE'], 'HealthRecords', async (rec, req) => {
      if (!rec?.animal_ID) return;
      // keep Animal master in sync (FR-ADM-013, FR-ADM-016)
      const eligible = rec.healthStatus === 'Healthy' && rec.vaccinationStatus === 'Vaccinated';
      const upd = { adoptionEligible: eligible };
      if (rec.healthStatus) upd.healthStatus = rec.healthStatus;
      if (rec.vaccinationStatus) upd.vaccinationStatus = rec.vaccinationStatus;
      await UPDATE(Animals).set(upd).where({ ID: rec.animal_ID });
      await audit('HealthRecords', rec.ID, req.event, req.user, rec);
    });
    this.on('scheduleCheckup', 'HealthRecords', async req => {
      const ID = idOf(req.params[0]);
      if (new Date(req.data.nextCheckupDate) < new Date(new Date().toDateString()))
        return req.error(400, 'Checkup date must be today or in the future');
      await UPDATE(HealthRecords).set({ nextCheckupDate: req.data.nextCheckupDate }).where({ ID });
      await audit('HealthRecords', ID, 'SCHEDULE_CHECKUP', req.user, req.data);
      return SELECT.one.from(HealthRecords).where({ ID });
    });
    this.on('markRecovered', 'HealthRecords', async req => {
      const ID = idOf(req.params[0]);
      const rec = await SELECT.one.from(HealthRecords).where({ ID });
      await UPDATE(HealthRecords).set({ recovered: true, healthStatus: 'Healthy' }).where({ ID });
      await UPDATE(Animals).set({ healthStatus: 'Healthy' }).where({ ID: rec.animal_ID });
      await audit('HealthRecords', ID, 'MARK_RECOVERED', req.user);
      return SELECT.one.from(HealthRecords).where({ ID });
    });

    // ========== INSPECTIONS ==========
    this.on('scheduleInspection', 'Adoptions', async req => {     // FR-ADM-017
      const ID = idOf(req.params[0]);
      const adp = await SELECT.one.from(Adoptions).where({ ID });
      const { inspectionDate, inspector, inspectionType } = req.data;
      if (!inspectionDate) return req.error(400, 'Inspection date is required');
      if (inspectionDate < adp.adoptionDate) return req.error(400, 'Inspection cannot be before the adoption date');
      const newId = cds.utils.uuid();
      await INSERT.into(Inspections).entries({
        ID: newId, adoption_ID: ID, animal_ID: adp.animal_ID,
        inspectionDate, inspector, inspectionType, result: 'Scheduled'
      });
      await audit('Inspections', newId, 'SCHEDULE', req.user, req.data);
      return SELECT.one.from(Inspections).where({ ID: newId });
    });
    this.on('recordResult', 'Inspections', async req => {         // FR-ADM-018/019
      const ID = idOf(req.params[0]);
      const { result, findings, remarks } = req.data;
      if (!['Validated', 'Follow-up Required', 'Failed'].includes(result))
        return req.error(400, 'Result must be Validated, Follow-up Required or Failed');
      const insp = await SELECT.one.from(Inspections).where({ ID });
      await UPDATE(Inspections).set({ result, animalCondition: findings, remarks }).where({ ID });
      if (result === 'Validated')
        await UPDATE(Adoptions).set({ status: 'Completed' }).where({ ID: insp.adoption_ID });
      await audit('Inspections', ID, 'RECORD_RESULT', req.user, req.data);
      return SELECT.one.from(Inspections).where({ ID });
    });

    // ========== DASHBOARD ==========
    this.on('getAnimalSummary', async () => {
      const rows = await SELECT.from(Animals).columns('adoptionStatus', 'count(*) as n').groupBy('adoptionStatus');
      const c = s => rows.find(r => r.adoptionStatus === s)?.n || 0;
      return {
        totalAnimals: rows.reduce((t, r) => t + r.n, 0),
        available: c('Available'), adopted: c('Adopted'),
        unavailable: c('Reserved') + c('Under Treatment')
      };
    });
    this.on('getApplicationStatusDistribution', async () => {
      const rows = await SELECT.from(AdoptionApplications).columns('status', 'count(*) as count').groupBy('status');
      return ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Withdrawn']
        .map(s => ({ status: s, count: rows.find(r => r.status === s)?.count || 0 }));
    });
    this.on('getAdoptionTrend', async req => {
      const months = req.data.months || 12;
      const from = new Date(); from.setMonth(from.getMonth() - months + 1); from.setDate(1);
      const rows = await SELECT.from(Adoptions).columns('adoptionDate')
        .where({ adoptionDate: { '>=': from.toISOString().slice(0, 10) } });
      const buckets = {};
      rows.forEach(r => { const k = r.adoptionDate.slice(0, 7); buckets[k] = (buckets[k] || 0) + 1; });
      return Object.keys(buckets).sort().map(k => ({ period: k, count: buckets[k] }));
    });
    this.on('getShelterOccupancy', async () => {
      const shelters = await SELECT.from(Shelters);
      const out = [];
      for (const s of shelters) {
        const [{ n }] = await SELECT.from(Animals).columns('count(*) as n')
          .where({ shelter_ID: s.ID, adoptionStatus: { '!=': 'Adopted' } });
        out.push({
          shelterName: s.name, location: s.city, currentOccupancy: n,
          totalCapacity: s.capacity, occupancyPct: s.capacity ? +((n / s.capacity) * 100).toFixed(2) : 0
        });
      }
      return out;
    });
    this.on('getOverdueCheckups', async () =>
      SELECT.from(HealthRecords).where({ nextCheckupDate: { '<': new Date().toISOString().slice(0, 10) }, recovered: false }));


    // ---- Retention guards (NFR-005: keep adoption history for 7 years) ----
    this.before('DELETE', 'Animals', async req => {
      const ID = req.data.ID;
      const [{ n: apps }] = await SELECT.from(AdoptionApplications).columns('count(*) as n').where({ animal_ID: ID });
      const [{ n: adps }] = await SELECT.from(Adoptions).columns('count(*) as n').where({ animal_ID: ID });
      if (apps || adps) return req.reject(409,
        'This animal has adoption history that must be retained for 7 years. Change its adoption status instead of deleting it.');
    });
    this.before('DELETE', 'Shelters', async req => {
      const [{ n }] = await SELECT.from(Animals).columns('count(*) as n').where({ shelter_ID: req.data.ID });
      if (n) return req.reject(409, 'This shelter still has animals. Move them first, or set the shelter to Inactive.');
    });
    this.before('DELETE', 'Users', async req => {
      const ID = req.data.ID;
      const [{ n: apps }] = await SELECT.from(AdoptionApplications).columns('count(*) as n').where({ applicant_ID: ID });
      const [{ n: adps }] = await SELECT.from(Adoptions).columns('count(*) as n').where({ adopter_ID: ID });
      if (apps || adps) return req.reject(409,
        'This user has adoption history that must be retained. Set the user to Inactive instead.');
    });

    // ---- Audit: record every create and update (NFR-006) ----
    for (const name of ['Animals', 'Shelters', 'Users', 'Inspections']) {
      this.after(['CREATE', 'UPDATE'], name, async (data, req) => {
        if (!data || !data.ID) return;
        const skip = /^(ID|IsActiveEntity|HasActiveEntity|HasDraftEntity|DraftAdministrativeData.*)$/;
        const changed = Object.keys(req.data || {}).filter(k => !skip.test(k));
        await audit(name, data.ID, req.event, req.user, { fields: changed });
      });
    };

    // ========== DOCUMENT AND PICTURE LINKS ==========
    const urlOk = u => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };
    const httpOnly = (req, field) => {
      const v = req.data[field];
      if (v && !urlOk(v.trim())) req.error(400, 'Please enter a valid link starting with https://', field);
    };
    this.before(['CREATE', 'UPDATE'], 'Animals', req => httpOnly(req, 'photoUrl'));
    this.before(['CREATE', 'UPDATE'], 'Shelters', req => httpOnly(req, 'imageUrl'));

    const docs = {
      Adoptions: ['AdoptionDocuments', 'adoption_ID', Adoptions],
      HealthRecords: ['HealthDocuments', 'healthRecord_ID', HealthRecords],
      Inspections: ['InspectionDocuments', 'inspection_ID', Inspections]
    };
    for (const [parent, [docName, fk, parentEntity]] of Object.entries(docs)) {
      this.on('addDocument', parent, async req => {
        const ID = idOf(req.params[0]);
        const { docType, fileName, url } = req.data;
        if (!fileName || !fileName.trim()) return req.error(400, 'Please enter a document name');
        if (!url || !urlOk(url.trim())) return req.error(400, 'Please enter a valid link starting with https://');
        await INSERT.into(db[docName]).entries({ [fk]: ID, docType, fileName: fileName.trim(), url: url.trim() });
        await audit(parent, ID, 'ADD_DOCUMENT', req.user, { fileName, url });
        return SELECT.one.from(parentEntity).where({ ID });
      });
      this.on('removeDocument', docName, async req => {
        const ID = idOf(req.params[0]);
        await DELETE.from(db[docName]).where({ ID });
        await audit(docName, ID, 'REMOVE_DOCUMENT', req.user);
      });
      this.before(['CREATE', 'UPDATE'], docName, req => {
        if (req.data.url && !urlOk(req.data.url)) req.error(400, 'Please enter a valid link starting with https://', 'url');
      });
    };

    // ---- Photo and image links ----
    this.on('setPhotoLink', 'Animals', async req => {
      const ID = idOf(req.params[0]);
      const url = (req.data.url || '').trim();
      if (!urlOk(url)) return req.error(400, 'Please enter a valid link starting with https://');
      await UPDATE(Animals).set({ photoUrl: url }).where({ ID });
      await audit('Animals', ID, 'SET_PHOTO', req.user, { url });
      return SELECT.one.from(Animals).where({ ID });
    });
    this.on('setImageLink', 'Shelters', async req => {
      const ID = idOf(req.params[0]);
      const url = (req.data.url || '').trim();
      if (!urlOk(url)) return req.error(400, 'Please enter a valid link starting with https://');
      await UPDATE(Shelters).set({ imageUrl: url }).where({ ID });
      await audit('Shelters', ID, 'SET_IMAGE', req.user, { url });
      return SELECT.one.from(Shelters).where({ ID });
    });

    // New inspection: take the animal from the chosen adoption
    this.before('CREATE', 'Inspections', async req => {
      if (req.data.adoption_ID && !req.data.animal_ID) {
        const a = await SELECT.one.from(Adoptions).columns('animal_ID').where({ ID: req.data.adoption_ID });
        if (a) req.data.animal_ID = a.animal_ID;
      }
    });

    // ---- file upload from a device to Cloudinary ----
    const FOLDERS = { animal: 'aat/animals', shelter: 'aat/shelters', document: 'aat/documents' };
    this.on('uploadFile', async req => {
      const { kind, fileName, mediaType, content } = req.data;
      const folder = FOLDERS[kind];
      if (!folder) return req.error(400, 'Unknown upload type');
      try {
        const r = await cl.upload({ content, mediaType, folder });
        return { url: r.url, publicId: r.publicId, fileName };
      } catch (e) { return req.error(502, 'Upload failed: ' + (e.message || e)); }
    });

    // ---- users created by the admin ----
    this.before('CREATE', 'Users', async req => {
      req.data.userId = await nextNumber('Users', 'userId', 'USR');
      const email = (req.data.email || '').trim().toLowerCase();
      if (email) {
        req.data.email = email;
        const dup = await SELECT.one.from(db.Users).where({ email });
        if (dup) req.error(409, 'A user with this email already exists', 'email');
      }
    });

    // ---- dashboard: pending work ----
    this.on('getPendingCounts', async () => {
      const [{ n: apps }] = await SELECT.from(AdoptionApplications).columns('count(*) as n').where({ status: { in: ['Submitted', 'Under Review'] } });
      const [{ n: insp }] = await SELECT.from(Inspections).columns('count(*) as n').where({ result: { in: ['Scheduled', 'Follow-up Required'] } });
      return { pendingApplications: apps, pendingInspections: insp };
    });

    // ---- health records: colour the next checkup date (red = overdue) ----
    this.after('READ', 'HealthRecords', rows => {
      const today = new Date().toISOString().slice(0, 10);
      for (const r of (Array.isArray(rows) ? rows : [rows])) {
        if (!r || r.nextCheckupDate === undefined) continue;
        r.checkupCriticality = (!r.recovered && r.nextCheckupDate && r.nextCheckupDate < today) ? 1 : (r.nextCheckupDate ? 3 : 0);
      }
    });

    return super.init();
  }
};