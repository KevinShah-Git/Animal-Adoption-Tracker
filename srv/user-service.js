const cds = require('@sap/cds');
const { nextNumber, audit, addHistory } = require('./lib/common');

module.exports = class UserService extends cds.ApplicationService {
  async init() {
    const { Users, Animals, AdoptionApplications, ApplicationDocuments, AdoptionDocuments, Adoptions, HealthDocuments } = cds.entities('aat');
    const idOf = p => (typeof p === 'object' ? p.ID : p);

    // first-login registration (FR-USR-001)
    this.on('registerProfile', async req => {
      let me = await SELECT.one.from(Users).where({ email: req.user.id });
      if (!me) {
        const ID = cds.utils.uuid();
        await INSERT.into(Users).entries({
          ID, userId: await nextNumber('Users', 'userId', 'USR'),
          firstName: req.user.attr?.givenName || 'New', lastName: req.user.attr?.familyName || 'User',
          email: req.user.id, role: 'User', status: 'Active'
        });
        me = await SELECT.one.from(Users).where({ ID });
      }
      return me;
    });
    this.before(['CREATE', 'UPDATE'], 'Users', req => {          // profile validation
      const d = req.data;
      if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) req.error(400, 'Invalid email', 'email');
      if (d.phone && !/^[0-9+\-\s]{7,15}$/.test(d.phone)) req.error(400, 'Invalid phone number', 'phone');
      delete d.role;                                             // users cannot self-assign roles
    });
    this.before('CREATE', 'Users', async req => {
      req.data.userId = await nextNumber('Users', 'userId', 'USR');
      req.data.email = req.user.id;
    });

    // submit application (FR-USR-007)
    this.before('CREATE', 'AdoptionApplications', async req => {
      const me = await SELECT.one.from(Users).where({ email: req.user.id });
      if (!me) return req.error(400, 'Please complete your profile first');
      const animal = await SELECT.one.from(Animals).where({ ID: req.data.animal_ID });
      if (!animal || animal.adoptionStatus !== 'Available')
        return req.error(409, 'This animal is not available for adoption');
      const dup = await SELECT.one.from(AdoptionApplications).where({
        animal_ID: req.data.animal_ID, applicant_ID: me.ID, status: { in: ['Submitted', 'Under Review'] }
      });
      if (dup) return req.error(409, 'You already have an open application for this animal');
      Object.assign(req.data, {
        applicant_ID: me.ID, status: 'Submitted',
        applicationDate: new Date().toISOString().slice(0, 10),
        applicationNo: await nextNumber('AdoptionApplications', 'applicationNo', 'APP', 5),
        reviewedBy: null, reviewerRemarks: null, rejectionReason: null
      });
    });
    this.after('CREATE', 'AdoptionApplications', (app, req) =>
      addHistory(app.ID, null, 'Submitted', req.user));

    // update only before review
    this.before('UPDATE', 'AdoptionApplications', async req => {
      const app = await SELECT.one.from(AdoptionApplications).where({ ID: req.data.ID });
      if (app.status !== 'Submitted') return req.error(409, 'Application can only be edited before review');
      ['status', 'reviewedBy', 'reviewedAt', 'reviewerRemarks', 'rejectionReason', 'applicant_ID']
        .forEach(f => delete req.data[f]);
    });

    this.on('withdraw', 'AdoptionApplications', async req => {   // FR-USR-008
      const ID = idOf(req.params[0]);
      const app = await SELECT.one.from(AdoptionApplications).where({ ID });
      if (app.status !== 'Submitted') return req.error(409, 'Only applications not yet in review can be withdrawn');
      await UPDATE(AdoptionApplications).set({ status: 'Withdrawn' }).where({ ID });
      await addHistory(ID, app.status, 'Withdrawn', req.user);
      return SELECT.one.from(AdoptionApplications).where({ ID });
    });

    // supporting documents → Cloudinary
    this.on('addApplicationDocument', async req => {
      const { applicationID, docType, fileName, url } = req.data;
      const app = await SELECT.one.from(AdoptionApplications).where({ ID: applicationID });
      const me = await SELECT.one.from(Users).where({ email: req.user.id });
      if (!app || app.applicant_ID !== me?.ID) return req.error(403, 'Not your application');
      if (app.status !== 'Submitted') return req.error(409, 'Documents can only be added before review');
      if (!fileName || !fileName.trim()) return req.error(400, 'Please enter a document name');
      if (!url || !/^https?:\/\//i.test(url.trim())) return req.error(400, 'Please enter a valid link starting with https://');
      const ID = cds.utils.uuid();
      await INSERT.into(ApplicationDocuments).entries({ ID, application_ID: applicationID, docType, fileName: fileName.trim(), url: url.trim() });
      return ID;
    });

    // signed URL for own documents only (FR-USR-015)
    
    this.before('*', async req => {
      if (req.event === 'registerProfile') return;
      const u = await SELECT.one.from(Users).columns('status').where({ email: req.user.id });
      if (u && u.status === 'Inactive') req.reject(403, 'Your account is inactive. Please contact the shelter.');
    });

    return super.init();
  }
};
