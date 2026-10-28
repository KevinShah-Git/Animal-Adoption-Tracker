(function () {
    'use strict';
    const BASE = '/odata/v4/user/';
    const T = window.aatT || (s => s);
    const LOCALE = window.aatLang === 'hi' ? 'hi-IN' : undefined;
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const MAX = 10 * 1024 * 1024;
    const DOC_TYPES = ['Housing Proof', 'ID Proof', 'Supporting Document'];
    const HOUSING = ['Apartment', 'Independent House', 'Farm', 'Other'];

    const $ = (s, el = document) => el.querySelector(s);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const date = d => d ? new Date(d).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    const dtime = d => d ? new Date(d).toLocaleString(LOCALE, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const cls = s => String(s || '').toLowerCase().replace(/\s+/g, '-');
    const pill = s => `<span class="pill ${cls(s)}">${esc(s)}</span>`;
    const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    const fmtAge = n => { const v = Number(n); return Number.isInteger(v) ? String(v) : v.toFixed(1); };
    const urlOk = u => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };

    let me = null, animals = [], applicationsCache = [], health = null;   // health = { records, docs }
    const filters = { q: '', species: '', shelter: '', age: '', status: 'Available' };

    /* ---------- server calls ---------- */
    let csrf = null;
    async function csrfToken() {
        if (csrf !== null) return csrf;
        try { const r = await fetch(BASE, { headers: { 'X-CSRF-Token': 'Fetch' } }); csrf = r.headers.get('x-csrf-token') || ''; }
        catch (e) { csrf = ''; }
        return csrf;
    }
    async function api(method, path, body, retried) {
        const headers = { Accept: 'application/json' };
        if (body) headers['Content-Type'] = 'application/json';
        if (method !== 'GET') { const t = await csrfToken(); if (t) headers['X-CSRF-Token'] = t; }
        const r = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
        if (r.status === 401) { location.reload(); return null; }
        if (r.status === 403 && r.headers.get('x-csrf-token') === 'required' && !retried) { csrf = null; return api(method, path, body, true); }
        if (r.status === 204) return null;
        let data = null; try { data = await r.json(); } catch (e) { /* no body */ }
        if (!r.ok) { console.error('[portal] request failed', method, path, r.status, data); throw new Error((data && data.error && data.error.message) || ('Request failed (' + r.status + ')')); }
        return data;
    }
    const get = p => api('GET', p);
    const post = (p, b) => api('POST', p, b || {});

    function toast(msg, bad) {
        const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : '');
        clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = ''; }, 4200);
    }

    /* ---------- files: device -> Cloudinary -> link ---------- */
    const toBase64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
    function checkFile(f) {
        if (!ALLOWED.includes(f.type)) return f.name + ': only PDF, JPG and PNG files are allowed';
        if (f.size > MAX) return f.name + ': larger than 10 MB';
        return '';
    }
    async function uploadToCloud(file) {
        const bad = checkFile(file); if (bad) throw new Error(bad);
        const r = await post('uploadFile', { fileName: file.name, mediaType: file.type, content: await toBase64(file) });
        const url = r && (r.url || (r.value && r.value.url));
        if (!url) throw new Error('Upload failed, please try again');
        return url;
    }
    const docRow = () => `<div class="docrow">
    <label>Document type<select class="d-type">${DOC_TYPES.map(t => `<option>${t}</option>`).join('')}</select></label>
    <label>Name<input class="d-name" placeholder="e.g. Rent agreement"></label>
    <label class="full">Choose a file from your device (PDF, JPG or PNG, max 10 MB)<input type="file" class="d-file" accept="application/pdf,image/png,image/jpeg"></label>
    <label class="full">or paste a link (https://…)<input class="d-url" placeholder="https://…"></label></div>`;
    const readDocs = () => [...document.querySelectorAll('#f-docs .docrow')].map(r => ({
        docType: r.querySelector('.d-type').value, fileName: r.querySelector('.d-name').value.trim(),
        file: r.querySelector('.d-file').files[0] || null, url: r.querySelector('.d-url').value.trim()
    })).filter(r => r.file || r.url || r.fileName);
    function validateDocs(rows) {
        for (const r of rows) {
            if (r.file) { const bad = checkFile(r.file); if (bad) return bad; }
            else if (!urlOk(r.url)) return 'Each document needs a file or a valid link starting with https://';
        }
        return '';
    }
    async function attachDocs(applicationID, rows) {
        let ok = 0;
        for (const r of rows) {
            const label = r.fileName || (r.file && r.file.name) || r.url;
            try {
                const url = r.file ? await uploadToCloud(r.file) : r.url;
                await post('addApplicationDocument', { applicationID, docType: r.docType, fileName: r.fileName || (r.file && r.file.name) || 'Document', url });
                ok++;
            } catch (e) { toast(label + ': ' + e.message, true); }
        }
        return ok;
    }
    const docLinks = docs => {
        const list = (docs || []).filter(d => /^https?:\/\//i.test(d.url || ''));
        return list.length
            ? `<div class="docs">${list.map(d => `<a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">📎 ${esc(d.fileName || d.docType)}</a>`).join('')}</div>`
            : '<div class="meta">No documents</div>';
    };

    /* ---------- modal ---------- */
    function openModal(title, body) {
        $('#modal').innerHTML = `<div class="sheet"><div class="hd"><h3>${esc(title)}</h3><button class="x" data-act="close">×</button></div><div class="bd">${body}</div></div>`;
        $('#modal').classList.remove('hidden');
    }
    const closeModal = () => $('#modal').classList.add('hidden');

    /* ---------- views ---------- */
    const view = html => { $('#view').innerHTML = html; };
    const loading = () => view('<div class="empty">Loading…</div>');

    async function loadAnimals() {
        animals = (await get('Animals?$expand=shelter($select=ID,name,city,phone,email)&$top=500')).value;
    }
    const ensureAnimals = async () => { if (!animals.length) await loadAnimals(); };
    async function loadHealth() {
        if (health) return health;
        const [records, docs] = await Promise.all([get('HealthRecords'), get('HealthDocuments')]);
        health = { records: records.value, docs: docs.value };
        return health;
    }

    /* browse */
    const AGE = { '': () => true, young: a => a < 1, adult: a => a >= 1 && a <= 3, senior: a => a > 3 };
    function filterAnimals(list, f) {
        const q = f.q.trim().toLowerCase();
        return list.filter(a =>
            (!f.status || a.adoptionStatus === f.status) &&
            (!f.species || a.species === f.species) &&
            (!f.shelter || (a.shelter && a.shelter.ID === f.shelter)) &&
            (!f.age || (a.age != null && AGE[f.age](Number(a.age)))) &&
            (!q || (a.name + ' ' + (a.breed || '')).toLowerCase().includes(q)));
    }
    const countText = (n, status) => status === 'Available'
        ? `${n} animal${n === 1 ? '' : 's'} waiting for a loving home.` : `${n} animal${n === 1 ? '' : 's'} found.`;
    const card = a => `<div class="pet" data-act="openAnimal" data-id="${a.ID}">
    <div class="ph">${a.photoUrl ? `<img src="${esc(a.photoUrl)}" alt="${esc(a.name)}" onerror="this.parentNode.textContent='🐾'">` : '🐾'}</div>
    <div class="b"><h3>${esc(a.name)}</h3>
      <div class="m">${esc(a.species)}${a.breed ? ' · ' + esc(a.breed) : ''}${a.age != null ? ' · ' + fmtAge(a.age) + ' yr' : ''}</div>
      ${a.shelter ? `<div class="m">📍 ${esc(a.shelter.name)}</div>` : ''}
      <div class="f">${pill(a.adoptionStatus)}<span class="fee">${money(a.adoptionFee)}</span></div></div></div>`;
    const cardsHtml = list => list.length ? `<div class="cards">${list.map(card).join('')}</div>` : '<div class="empty">No animals match your filters.</div>';
    function updateCards() {
        const list = filterAnimals(animals, filters);
        $('#count').textContent = countText(list.length, filters.status);
        $('#cards').innerHTML = cardsHtml(list);
    }
    function renderBrowse() {
        const species = [...new Set(animals.map(a => a.species))].sort();
        const shelters = [...new Map(animals.filter(a => a.shelter).map(a => [a.shelter.ID, a.shelter.name])).entries()];
        const list = filterAnimals(animals, filters);
        const sel = (cur, v) => cur === v ? 'selected' : '';
        const banner = (me && me.firstName === 'New')
            ? '<div class="banner">👋 Welcome! Please <a data-route-link="profile">complete your profile</a> before you apply.</div>' : '';
        view(`${banner}<h2 class="page">Find your new best friend</h2>
      <p class="sub" id="count">${countText(list.length, filters.status)}</p>
      <div class="filters">
        <input data-filter="q" placeholder="Search by name or breed" value="${esc(filters.q)}">
        <select data-filter="species"><option value="">All species</option>${species.map(s => `<option ${sel(filters.species, s)}>${esc(s)}</option>`).join('')}</select>
        <select data-filter="shelter"><option value="">All shelters</option>${shelters.map(([id, n]) => `<option value="${id}" ${sel(filters.shelter, id)}>${esc(n)}</option>`).join('')}</select>
        <select data-filter="age">
          <option value="" ${sel(filters.age, '')}>Any age</option><option value="young" ${sel(filters.age, 'young')}>Under 1 year</option>
          <option value="adult" ${sel(filters.age, 'adult')}>1 to 3 years</option><option value="senior" ${sel(filters.age, 'senior')}>Over 3 years</option></select>
        <select data-filter="status">
          <option value="" ${sel(filters.status, '')}>All statuses</option>
          ${['Available', 'Reserved', 'Adopted', 'Under Treatment'].map(s => `<option value="${s}" ${sel(filters.status, s)}>${s}</option>`).join('')}</select>
      </div>
      <div id="cards">${cardsHtml(list)}</div>`);
    }

    async function openAnimal(id) {
        const a = animals.find(x => x.ID === id); if (!a) return;
        let recs = [], certs = [];
        try {
            const h = await loadHealth();
            recs = h.records.filter(r => r.animal_ID === id).sort((x, y) => String(y.checkupDate).localeCompare(String(x.checkupDate)));
            const ids = new Set(recs.map(r => r.ID));
            certs = h.docs.filter(d => ids.has(d.healthRecord_ID));
        } catch (e) { /* health information is optional */ }
        const latest = recs[0];
        const canApply = a.adoptionStatus === 'Available' && a.adoptionEligible;
        openModal(a.name, `
      ${a.photoUrl ? `<img src="${esc(a.photoUrl)}" alt="" onerror="this.remove()" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:14px">` : ''}
      <div>${pill(a.adoptionStatus)} ${pill(a.healthStatus)} ${pill(a.vaccinationStatus)}</div>
      <p>${esc(a.description || 'A lovely animal looking for a home.')}</p>
      <div class="kv">
        <div><small>Animal ID</small>${esc(a.animalId)}</div><div><small>Species / breed</small>${esc(a.species)} ${esc(a.breed || '')}</div>
        <div><small>Gender</small>${esc(a.gender || '–')}</div><div><small>Age</small>${a.age != null ? fmtAge(a.age) + ' years' : '–'}</div>
        <div><small>Colour</small>${esc(a.color || '–')}</div><div><small>Adoption fee</small>${money(a.adoptionFee)}</div>
        <div><small>Eligible for adoption</small>${a.adoptionEligible ? 'Yes' : 'No'}</div><div><small>Shelter</small>${esc(a.shelter ? a.shelter.name : '–')}</div>
        <div><small>Shelter contact</small>${esc(a.shelter ? (a.shelter.phone || a.shelter.email || '–') : '–')}</div>
      </div>
      ${latest ? `<h4>Health</h4><div class="meta">${esc(latest.healthSummary || 'Checked by our vet')}</div>
        ${latest.nextCheckupDate ? `<div class="meta">Next checkup: ${date(latest.nextCheckupDate)}</div>` : ''}` : ''}
      ${certs.length ? `<h4>Health certificates</h4>${docLinks(certs)}` : ''}
      <div style="margin-top:18px;display:flex;gap:10px">
        <button class="btn gold" data-act="applyForm" data-id="${a.ID}" ${canApply ? '' : 'disabled'}>${canApply ? 'Apply to adopt' : 'Not open for adoption'}</button>
        <button class="btn ghost" data-act="close">Close</button></div>`);
    }

    /* apply / edit an application */
    function appForm(animalId, app) {
        const editing = !!app;
        const a = editing ? (app.animal || { name: '' }) : animals.find(x => x.ID === animalId);
        openModal(editing ? 'Edit application' : 'Adopt ' + a.name, `<div class="form">
      <label>Why would you like to adopt ${esc(a.name)}? *<textarea id="f-reason" rows="3" maxlength="1000">${esc(editing ? app.reason : '')}</textarea></label>
      <div class="two">
        <label>Housing type<select id="f-housing">${HOUSING.map(h => `<option ${editing && app.housingType === h ? 'selected' : ''}>${h}</option>`).join('')}</select></label>
        <label>Do you have other pets?<select id="f-pets"><option value="false">No</option><option value="true" ${editing && app.hasOtherPets ? 'selected' : ''}>Yes</option></select></label>
      </div>
      <label>Pet experience<textarea id="f-exp" rows="2" maxlength="500">${esc(editing ? app.petExperience : '')}</textarea></label>
      ${editing ? '' : `<h4>Supporting documents</h4><div id="f-docs">${docRow()}</div>
        <div><button type="button" class="btn ghost" data-act="moreDoc">+ Add another document</button></div>`}
      <div style="display:flex;gap:10px">
        <button class="btn gold" data-act="submitApp" data-id="${esc(animalId || '')}" data-app="${editing ? app.ID : ''}">${editing ? 'Save changes' : 'Submit application'}</button>
        <button class="btn ghost" data-act="close">Cancel</button></div></div>`);
    }
    async function submitApp(d, btn) {
        const reason = $('#f-reason').value.trim();
        if (!reason) { toast('Please tell us why you want to adopt', true); return; }
        const body = { reason, housingType: $('#f-housing').value, hasOtherPets: $('#f-pets').value === 'true', petExperience: $('#f-exp').value.trim() || null };
        const editing = !!d.app;
        const rows = editing ? [] : readDocs();
        const bad = validateDocs(rows); if (bad) { toast(bad, true); return; }
        btn.disabled = true;
        try {
            if (editing) {
                await api('PATCH', `AdoptionApplications(${d.app})`, body);
                closeModal(); toast('Application updated'); renderApplications(); return;
            }
            body.animal_ID = d.id;
            const app = await post('AdoptionApplications', body);
            const n = rows.length ? await attachDocs(app.ID, rows) : 0;
            closeModal();
            toast('Application ' + app.applicationNo + ' submitted' + (n ? ' with ' + n + ' document(s)' : ''));
            go('applications');
        } catch (e) { btn.disabled = false; toast(e.message, true); }
    }
    function docForm(appId) {
        openModal('Add document', `<div class="form"><div id="f-docs">${docRow()}</div>
      <div style="display:flex;gap:10px"><button class="btn gold" data-act="submitDoc" data-id="${appId}">Upload</button>
      <button class="btn ghost" data-act="close">Cancel</button></div></div>`);
    }
    async function submitDoc(d, btn) {
        const rows = readDocs();
        if (!rows.length) { toast('Choose a file or paste a link', true); return; }
        const bad = validateDocs(rows); if (bad) { toast(bad, true); return; }
        btn.disabled = true;
        const n = await attachDocs(d.id, rows);
        if (n) { closeModal(); toast('Document added'); renderApplications(); } else { btn.disabled = false; }
    }

    /* my applications */
    async function renderApplications() {
        loading(); await ensureAnimals();
        const [apps, hist, docs] = await Promise.all([get('AdoptionApplications'), get('ApplicationHistory'), get('ApplicationDocuments')]);
        applicationsCache = apps.value.slice().sort((x, y) => String(y.applicationDate).localeCompare(String(x.applicationDate)))
            .map(a => ({
                ...a, animal: animals.find(x => x.ID === a.animal_ID),
                history: hist.value.filter(h => h.application_ID === a.ID), documents: docs.value.filter(d => d.application_ID === a.ID)
            }));
        view(`<h2 class="page">My applications</h2><p class="sub">Follow every step of your adoption journey.</p>
      ${applicationsCache.length ? applicationsCache.map(a => {
            const hist = (a.history || []).slice().sort((x, y) => String(x.changedAt).localeCompare(String(y.changedAt)));
            const an = a.animal || {};
            return `<div class="panel"><div class="top"><div><h3>${esc(an.name || 'Animal')} · ${esc(a.applicationNo)}</h3>
          <div class="meta">${esc(an.species || '')}${an.breed ? ' · ' + esc(an.breed) : ''}</div>
          <div class="meta">Applied on ${date(a.applicationDate)}</div></div>${pill(a.status)}</div>
          <p>${esc(a.reason)}</p>
          ${a.status === 'Rejected' && a.rejectionReason ? `<div class="note">Reason: ${esc(a.rejectionReason)}</div>` : ''}
          ${a.reviewerRemarks ? `<div class="meta">Staff remarks: ${esc(a.reviewerRemarks)}</div>` : ''}
          <div class="tl">${hist.map(h => `<div><b>${esc(h.toStatus)}</b><small>${dtime(h.changedAt)}${h.remarks ? ' · ' + esc(h.remarks) : ''}</small></div>`).join('')}</div>
          ${docLinks(a.documents)}
          ${a.status === 'Submitted' ? `<div class="acts"><button class="btn ghost" data-act="editApp" data-id="${a.ID}">Edit</button>
            <button class="btn ghost" data-act="docForm" data-id="${a.ID}">Add document</button>
            <button class="btn danger" data-act="withdraw" data-id="${a.ID}">Withdraw</button></div>` : ''}</div>`;
        }).join('') : '<div class="empty">You have not applied for any animal yet.</div>'}`);
    }

    /* my adoptions */
    async function renderAdoptions() {
        loading(); await ensureAnimals();
        const [adsRes, docsRes, inspRes] = await Promise.all([get('Adoptions'), get('AdoptionDocuments'), get('Inspections')]);
        const ads = adsRes.value.slice().sort((x, y) => String(y.adoptionDate).localeCompare(String(x.adoptionDate)))
            .map(a => ({ ...a, animal: animals.find(x => x.ID === a.animal_ID), documents: docsRes.value.filter(d => d.adoption_ID === a.ID) }));
        const insp = inspRes.value.slice().sort((x, y) => String(y.inspectionDate).localeCompare(String(x.inspectionDate)));
        const one = a => {
            const mine = insp.filter(i => i.adoption_ID === a.ID);
            const an = a.animal || {}, sh = an.shelter;
            return `<div class="panel"><div class="top"><div><h3>${esc(an.name || 'Animal')} · ${esc(a.adoptionNo)}</h3>
        <div class="meta">${esc(an.species || '')}${an.breed ? ' · ' + esc(an.breed) : ''}</div>
        <div class="meta">Adopted on ${date(a.adoptionDate)}</div>
        ${sh ? `<div class="meta">📍 ${esc(sh.name)}${sh.city ? ', ' + esc(sh.city) : ''}${sh.phone ? ' · ' + esc(sh.phone) : ''}</div>` : ''}</div>${pill(a.status)}</div>
        ${a.remarks ? `<p>${esc(a.remarks)}</p>` : ''}
        <h4>Documents</h4>${docLinks(a.documents)}
        <h4>Inspections</h4>${mine.length ? mine.map(i => `<div class="meta" style="margin:6px 0">${date(i.inspectionDate)} · ${esc(i.inspectionType || 'Inspection')} ${pill(i.result)}${i.remarks ? ' · ' + esc(i.remarks) : ''}</div>`).join('') : '<div class="meta">No inspections scheduled yet</div>'}</div>`;
        };
        const current = ads.filter(a => a.status === 'Active'), previous = ads.filter(a => a.status !== 'Active');
        view(`<h2 class="page">My adoptions</h2><p class="sub">Your adoption records, documents and follow-up inspections.</p>
      ${ads.length ? `${current.length ? `<h3 class="grp">Current adoptions</h3>${current.map(one).join('')}` : ''}
        ${previous.length ? `<h3 class="grp">Previous adoptions</h3>${previous.map(one).join('')}` : ''}`
                : '<div class="empty">No adoptions yet. Your approved applications will appear here.</div>'}`);
    }

    /* profile */
    function renderProfile() {
        view(`<h2 class="page">My profile</h2><p class="sub">Keep your contact details up to date.</p>
      <div class="panel"><div class="form" style="max-width:640px">
        <div class="two"><label>First name<input id="p-first" value="${esc(me.firstName)}"></label><label>Last name<input id="p-last" value="${esc(me.lastName)}"></label></div>
        <div class="two"><label>Email<input value="${esc(me.email)}" disabled></label><label>Phone<input id="p-phone" value="${esc(me.phone || '')}"></label></div>
        <label>Address<input id="p-addr" value="${esc(me.address || '')}"></label>
        <div class="two"><label>City<input id="p-city" value="${esc(me.city || '')}"></label><label>State<input id="p-state" value="${esc(me.state || '')}"></label></div>
        <label style="max-width:240px">Pincode<input id="p-pin" value="${esc(me.pincode || '')}"></label>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn gold" data-act="saveProfile">Save changes</button>
          <button class="btn danger" data-act="deleteProfile">Delete my profile</button></div></div></div>`);
    }
    async function saveProfile() {
        const body = {
            firstName: $('#p-first').value.trim(), lastName: $('#p-last').value.trim(), phone: $('#p-phone').value.trim(),
            address: $('#p-addr').value.trim(), city: $('#p-city').value.trim(), state: $('#p-state').value.trim(), pincode: $('#p-pin').value.trim()
        };
        if (!body.firstName || !body.lastName) { toast('First and last name are required', true); return; }
        try { me = Object.assign(me, await api('PATCH', `Users(${me.ID})`, body)); showMe(); toast('Profile saved'); }
        catch (e) { toast(e.message, true); }
    }
    async function deleteProfile() {
        if (!confirm(T('Delete your profile? This cannot be undone.'))) return;
        try { await api('DELETE', `Users(${me.ID})`); location.href = '/logout'; }
        catch (e) { toast(e.message, true); }
    }
    const showMe = () => { $('#me').innerHTML = `<b>${esc(me.firstName)} ${esc(me.lastName)}</b>${esc(me.email)}`; };

    /* ---------- routing and events ---------- */
    function go(route) {
        if (!['browse', 'applications', 'adoptions', 'profile'].includes(route)) route = 'browse';
        location.hash = '#/' + route;
    }
    async function render() {
        const route = (location.hash.replace('#/', '') || 'browse');
        document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.route === route));
        try {
            if (route === 'browse') { loading(); await loadAnimals(); renderBrowse(); }
            else if (route === 'applications') await renderApplications();
            else if (route === 'adoptions') await renderAdoptions();
            else if (route === 'profile') renderProfile();
            else go('browse');
        } catch (e) { view(`<div class="note">${esc(e.message)}</div>`); }
    }

    const actions = {
        close: closeModal,
        openAnimal: d => openAnimal(d.id),
        applyForm: d => appForm(d.id, null),
        editApp: d => { const a = applicationsCache.find(x => x.ID === d.id); if (a) appForm(null, a); },
        submitApp, moreDoc: () => $('#f-docs').insertAdjacentHTML('beforeend', docRow()),
        docForm: d => docForm(d.id), submitDoc, saveProfile, deleteProfile,
        withdraw: async d => {
            if (!confirm(T('Withdraw this application?'))) return;
            try { await post(`AdoptionApplications(${d.id})/UserService.withdraw`); toast('Application withdrawn'); renderApplications(); }
            catch (e) { toast(e.message, true); }
        }
    };

    document.addEventListener('click', e => {
        const rl = e.target.closest('[data-route-link]'); if (rl) { go(rl.dataset.routeLink); return; }
        const nb = e.target.closest('#nav button'); if (nb) { go(nb.dataset.route); return; }
        if (e.target.id === 'modal') { closeModal(); return; }
        const t = e.target.closest('[data-act]'); if (t && actions[t.dataset.act]) actions[t.dataset.act](t.dataset, t);
    });
    document.addEventListener('input', e => {
        const f = e.target.dataset && e.target.dataset.filter; if (!f) return;
        filters[f] = e.target.value;
        updateCards();
    });
    window.addEventListener('hashchange', render);

    (async function init() {
        try { me = await post('registerProfile'); showMe(); }
        catch (e) { $('#me').textContent = 'Not signed in'; view(`<div class="note">${esc(e.message)}<br>Please sign in as an adopter.</div>`); return; }
        render();
    })();
})();