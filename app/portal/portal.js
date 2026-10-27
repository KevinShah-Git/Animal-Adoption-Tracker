(function () {
    'use strict';
    const BASE = '/odata/v4/user/';
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const MAX = 10 * 1024 * 1024;
    const $ = (s, el = document) => el.querySelector(s);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const date = d => d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    const dtime = d => d ? new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const cls = s => String(s || '').toLowerCase().replace(/\s+/g, '-');
    const pill = s => `<span class="pill ${cls(s)}">${esc(s)}</span>`;
    const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

    let me = null, animals = [];
    const filters = { q: '', species: '', shelter: '', all: false };

    /* ---------- helpers ---------- */
    let csrf = null;
    async function csrfToken() {
        if (csrf !== null) return csrf;
        try {
            const r = await fetch(BASE, { headers: { 'X-CSRF-Token': 'Fetch' } });
            csrf = r.headers.get('x-csrf-token') || '';
        } catch (e) { csrf = ''; }
        return csrf;
    }
    async function api(method, path, body, retried) {
        const headers = { Accept: 'application/json' };
        if (body) headers['Content-Type'] = 'application/json';
        if (method !== 'GET') { const t = await csrfToken(); if (t) headers['X-CSRF-Token'] = t; }
        const r = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
        if (r.status === 401) { location.reload(); return null; }                       // session expired: sign in again
        if (r.status === 403 && r.headers.get('x-csrf-token') === 'required' && !retried) {
            csrf = null; return api(method, path, body, true);
        }
        if (r.status === 204) return null;
        let data = null; try { data = await r.json(); } catch (e) { /* no body */ }
        if (!r.ok) throw new Error((data && data.error && data.error.message) || ('Request failed (' + r.status + ')'));
        return data;
    }
    const get = p => api('GET', p);
    const post = (p, b) => api('POST', p, b || {});

    function toast(msg, bad) {
        const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : '');
        clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = ''; }, 3800);
    }
    const urlOk = u => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };
    async function addLinks(applicationID, links) {
        let ok = 0;
        for (const l of links) {
            try { await post('addApplicationDocument', { applicationID, docType: l.docType, fileName: l.fileName, url: l.url }); ok++; }
            catch (e) { toast((l.fileName || l.url) + ': ' + e.message, true); }
        }
        return ok;
    }
    const docLinks = docs => (docs && docs.length)
        ? `<div class="docs">${docs.filter(d => /^https?:\/\//i.test(d.url || '')).map(d => `<a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">📎 ${esc(d.fileName || d.docType)}</a>`).join('')}</div>`
        : '<div class="meta">No documents</div>';
    const linkRow = () => `<div class="two linkrow" style="margin-bottom:8px">
     <label>Document type<select class="l-type"><option>Housing Proof</option><option>ID Proof</option><option>Supporting Document</option></select></label>
     <label>Name<input class="l-name" placeholder="e.g. Rent agreement"></label>
     <label style="grid-column:1/-1">Link (https://…)<input class="l-url" placeholder="https://…"></label></div>`;
    function readLinks() {
        return [...document.querySelectorAll('#f-links .linkrow')].map(r => ({
            docType: r.querySelector('.l-type').value, fileName: r.querySelector('.l-name').value.trim(), url: r.querySelector('.l-url').value.trim()
        })).filter(l => l.url || l.fileName);
    }

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

    function renderBrowse() {
        const species = [...new Set(animals.map(a => a.species))].sort();
        const shelters = [...new Map(animals.filter(a => a.shelter).map(a => [a.shelter.ID, a.shelter.name])).entries()];
        let list = animals.filter(a =>
            (filters.all || a.adoptionStatus === 'Available') &&
            (!filters.species || a.species === filters.species) &&
            (!filters.shelter || (a.shelter && a.shelter.ID === filters.shelter)) &&
            (!filters.q || (a.name + ' ' + (a.breed || '')).toLowerCase().includes(filters.q.toLowerCase())));
        const banner = (me && me.firstName === 'New')
            ? '<div class="banner">👋 Welcome! Please <a data-route-link="profile">complete your profile</a> before you apply.</div>' : '';
        view(`${banner}<h2 class="page">Find your new best friend</h2>
      <p class="sub">${list.length} animal${list.length === 1 ? '' : 's'} waiting for a loving home.</p>
      <div class="filters">
        <input data-filter="q" placeholder="Search by name or breed" value="${esc(filters.q)}">
        <select data-filter="species"><option value="">All species</option>${species.map(s => `<option ${filters.species === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
        <select data-filter="shelter"><option value="">All shelters</option>${shelters.map(([id, n]) => `<option value="${id}" ${filters.shelter === id ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <label><input type="checkbox" data-filter="all" ${filters.all ? 'checked' : ''}> Show adopted / reserved too</label>
      </div>
      ${list.length ? `<div class="cards">${list.map(a => `
        <div class="pet" data-act="openAnimal" data-id="${a.ID}">
          <div class="ph">${a.photoUrl ? `  <img src="${esc(a.photoUrl)}" alt="${esc(a.name)}" onerror="this.parentNode.textContent='🐾'">>` : '🐾'}</div>
          <div class="b"><h3>${esc(a.name)}</h3>
            <div class="m">${esc(a.species)}${a.breed ? ' · ' + esc(a.breed) : ''}${a.age != null ? ' · ' + a.age + ' yr' : ''}</div>
            <div class="f">${pill(a.adoptionStatus)}<span class="fee">${money(a.adoptionFee)}</span></div>
          </div></div>`).join('')}</div>` : '<div class="empty">No animals match your filters.</div>'}`);
    }

    async function openAnimal(id) {
        const a = animals.find(x => x.ID === id); if (!a) return;
        let recs = [], certs = [];
        try {
            recs = (await get(`HealthRecords?$filter=animal_ID eq ${id}`)).value;
            for (const r of recs) certs = certs.concat((await get(`HealthDocuments?$filter=healthRecord_ID eq ${r.ID}`)).value);
        } catch (e) { /* health info is optional */ }
        const canApply = a.adoptionStatus === 'Available' && a.adoptionEligible;
        openModal(a.name, `
      ${a.photoUrl ? `<img src="${esc(a.photoUrl)}" alt="" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:14px">` : ''}
      <div>${pill(a.adoptionStatus)} ${pill(a.healthStatus)} ${pill(a.vaccinationStatus)}</div>
      <p>${esc(a.description || 'A lovely animal looking for a home.')}</p>
      <div class="kv">
        <div><small>Animal ID</small>${esc(a.animalId)}</div><div><small>Species / breed</small>${esc(a.species)} ${esc(a.breed || '')}</div>
        <div><small>Gender</small>${esc(a.gender || '–')}</div><div><small>Age</small>${a.age != null ? a.age + ' years' : '–'}</div>
        <div><small>Colour</small>${esc(a.color || '–')}</div><div><small>Adoption fee</small>${money(a.adoptionFee)}</div>
        <div><small>Shelter</small>${esc(a.shelter ? a.shelter.name : '–')}</div><div><small>Shelter contact</small>${esc(a.shelter ? (a.shelter.phone || a.shelter.email || '–') : '–')}</div>
      </div>
      ${recs.length ? `<h4>Health</h4>${recs.map(r => `<div class="meta">${esc(r.healthSummary || 'Checked by our vet')}${r.nextCheckupDate ? ' · next checkup ' + date(r.nextCheckupDate) : ''}</div>`).join('')}` : ''}
      ${certs.length ? `<h4>Health certificates</h4>${docLinks(certs, 'HealthDoc')}` : ''}
      <div class="acts" style="margin-top:18px;display:flex;gap:10px">
        <button class="btn gold" data-act="applyForm" data-id="${a.ID}" ${canApply ? '' : 'disabled'}>${canApply ? 'Apply to adopt' : 'Not open for adoption'}</button>
        <button class="btn ghost" data-act="close">Close</button></div>`);
    }

    function applyForm(id) {
        const a = animals.find(x => x.ID === id);
        openModal('Adopt ' + a.name, `<div class="form">
      <label>Why would you like to adopt ${esc(a.name)}? *<textarea id="f-reason" rows="3" maxlength="1000"></textarea></label>
      <div class="two">
        <label>Housing type<select id="f-housing"><option>Apartment</option><option>Independent House</option><option>Farm</option><option>Other</option></select></label>
        <label>Do you have other pets?<select id="f-pets"><option value="false">No</option><option value="true">Yes</option></select></label>
      </div>
      <label>Pet experience<textarea id="f-exp" rows="2" maxlength="500"></textarea></label>
      <div class="two">
           <div id="f-links">${linkRow()}</div>
           <div><button type="button" class="btn ghost" data-act="moreLink">+ Add another link</button></div>
      </div>
      <div style="display:flex;gap:10px"><button class="btn gold" data-act="submitApply" data-id="${id}">Submit application</button>
      <button class="btn ghost" data-act="close">Cancel</button></div></div>`);
    }

    async function submitApply(id, btn) {
        const reason = $('#f-reason').value.trim();
        if (!reason) { toast('Please tell us why you want to adopt', true); return; }
        const links = readLinks();
        for (const l of links) { if (!l.fileName || !urlOk(l.url)) { toast('Each document needs a name and a valid link starting with https://', true); return; } }
        btn.disabled = true;
        try {
            const body = { animal_ID: id, reason, housingType: $('#f-housing').value, hasOtherPets: $('#f-pets').value === 'true' };
            const exp = $('#f-exp').value.trim(); if (exp) body.petExperience = exp;
            const app = await post('AdoptionApplications', body);
            const n = links.length ? await addLinks(app.ID, links) : 0;
            closeModal();
            toast('Application ' + app.applicationNo + ' submitted' + (n ? ' with ' + n + ' document(s)' : ''));
            go('applications');
        } catch (e) { btn.disabled = false; toast(e.message, true); }
    }

    async function renderApplications() {
        loading();
        const apps = (await get('AdoptionApplications?$expand=animal($select=name,animalId),history,documents&$orderby=applicationDate desc')).value;
        view(`<h2 class="page">My applications</h2><p class="sub">Follow every step of your adoption journey.</p>
      ${apps.length ? apps.map(a => {
            const hist = (a.history || []).slice().sort((x, y) => String(x.changedAt).localeCompare(String(y.changedAt)));
            return `<div class="panel"><div class="top"><div><h3>${esc(a.animal ? a.animal.name : 'Animal')} · ${esc(a.applicationNo)}</h3>
          <div class="meta">Applied on ${date(a.applicationDate)}</div></div>${pill(a.status)}</div>
          <p>${esc(a.reason)}</p>
          ${a.status === 'Rejected' && a.rejectionReason ? `<div class="note">Reason: ${esc(a.rejectionReason)}</div>` : ''}
          ${a.reviewerRemarks ? `<div class="meta">Staff remarks: ${esc(a.reviewerRemarks)}</div>` : ''}
          <div class="tl">${hist.map(h => `<div><b>${esc(h.toStatus)}</b><small>${dtime(h.changedAt)}${h.remarks ? ' · ' + esc(h.remarks) : ''}</small></div>`).join('')}</div>
          ${docLinks(a.documents, 'ApplicationDoc')}
          ${a.status === 'Submitted' ? `<div class="acts"><button class="btn ghost" data-act="addDoc" data-id="${a.ID}">Add document</button>
            <button class="btn danger" data-act="withdraw" data-id="${a.ID}">Withdraw</button></div>` : ''}</div>`;
        }).join('') : '<div class="empty">You have not applied for any animal yet.</div>'}`);
    }

    async function renderAdoptions() {
        loading();
        const ads = (await get('Adoptions?$expand=animal($select=name,animalId),documents')).value;
        const insp = (await get('Inspections?$expand=animal($select=name)')).value;
        view(`<h2 class="page">My adoptions</h2><p class="sub">Your adoption records, documents and follow-up inspections.</p>
      ${ads.length ? ads.map(a => {
            const mine = insp.filter(i => i.adoption_ID === a.ID);
            return `<div class="panel"><div class="top"><div><h3>${esc(a.animal ? a.animal.name : 'Animal')} · ${esc(a.adoptionNo)}</h3>
          <div class="meta">Adopted on ${date(a.adoptionDate)}</div></div>${pill(a.status)}</div>
          <h4>Documents</h4>${docLinks(a.documents, 'AdoptionDoc')}
          <h4>Inspections</h4>${mine.length ? mine.map(i => `<div class="meta" style="margin:6px 0">${date(i.inspectionDate)} · ${esc(i.inspectionType || 'Inspection')} ${pill(i.result)}${i.remarks ? ' · ' + esc(i.remarks) : ''}</div>`).join('') : '<div class="meta">No inspections scheduled yet</div>'}</div>`;
        }).join('') : '<div class="empty">No adoptions yet. Your approved applications will appear here.</div>'}`);
    }

    function renderProfile() {
        view(`<h2 class="page">My profile</h2><p class="sub">Keep your contact details up to date.</p>
      <div class="panel"><div class="form" style="max-width:640px">
        <div class="two"><label>First name<input id="p-first" value="${esc(me.firstName)}"></label><label>Last name<input id="p-last" value="${esc(me.lastName)}"></label></div>
        <div class="two"><label>Email<input value="${esc(me.email)}" disabled></label><label>Phone<input id="p-phone" value="${esc(me.phone || '')}"></label></div>
        <label>Address<input id="p-addr" value="${esc(me.address || '')}"></label>
        <div class="two"><label>City<input id="p-city" value="${esc(me.city || '')}"></label><label>State<input id="p-state" value="${esc(me.state || '')}"></label></div>
        <label style="max-width:240px">Pincode<input id="p-pin" value="${esc(me.pincode || '')}"></label>
        <div><button class="btn gold" data-act="saveProfile">Save changes</button></div></div></div>`);
    }

    async function saveProfile() {
        const body = {
            firstName: $('#p-first').value.trim(), lastName: $('#p-last').value.trim(), phone: $('#p-phone').value.trim(),
            address: $('#p-addr').value.trim(), city: $('#p-city').value.trim(), state: $('#p-state').value.trim(), pincode: $('#p-pin').value.trim()
        };
        if (!body.firstName || !body.lastName) { toast('First and last name are required', true); return; }
        try {
            me = Object.assign(me, await api('PATCH', `Users(${me.ID})`, body));
            showMe(); toast('Profile saved');
        } catch (e) { toast(e.message, true); }
    }

    /* ---------- routing and events ---------- */
    async function go(route) {
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
    const showMe = () => { $('#me').innerHTML = `<b>${esc(me.firstName)} ${esc(me.lastName)}</b>${esc(me.email)}`; };

    const actions = {
        close: closeModal,
        openAnimal: d => openAnimal(d.id),
        applyForm: d => applyForm(d.id),
        submitApply: (d, el) => submitApply(d.id, el),
        saveProfile,
        withdraw: async d => {
            if (!confirm('Withdraw this application?')) return;
            try { await post(`AdoptionApplications(${d.id})/UserService.withdraw`); toast('Application withdrawn'); renderApplications(); }
            catch (e) { toast(e.message, true); }
        },
        moreLink: () => $('#f-links').insertAdjacentHTML('beforeend', linkRow()),
        addDoc: async d => {
            const url = (prompt('Paste the document link (https://…)') || '').trim(); if (!url) return;
            if (!urlOk(url)) { toast('Please enter a valid link starting with https://', true); return; }
            const name = prompt('Name for this document', 'Supporting document') || 'Supporting document';
            const n = await addLinks(d.id, [{ docType: 'Supporting Document', fileName: name, url }]);
            if (n) { toast('Document added'); renderApplications(); }
        },
    };

    document.addEventListener('click', e => {
        const rl = e.target.closest('[data-route-link]'); if (rl) { go(rl.dataset.routeLink); return; }
        const nb = e.target.closest('#nav button'); if (nb) { go(nb.dataset.route); return; }
        if (e.target.id === 'modal') { closeModal(); return; }
        const t = e.target.closest('[data-act]'); if (t && actions[t.dataset.act]) actions[t.dataset.act](t.dataset, t);
    });
    document.addEventListener('input', e => {
        const f = e.target.dataset && e.target.dataset.filter; if (!f) return;
        filters[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const pos = e.target.selectionStart; renderBrowse();
        const again = document.querySelector(`[data-filter="${f}"]`);
        if (again && again.type === 'text' || (again && again.tagName === 'INPUT' && again.type !== 'checkbox')) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) { /* ignore */ } }
    });
    window.addEventListener('hashchange', render);

    (async function init() {
        try { me = await post('registerProfile'); showMe(); }
        catch (e) { $('#me').textContent = 'Not signed in'; view(`<div class="note">${esc(e.message)}<br>Sign in as a User (for example alice@example.com).</div>`); return; }
        render();
    })();
})();