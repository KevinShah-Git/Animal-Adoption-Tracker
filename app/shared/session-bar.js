(function () {
    'use strict';
    if (window.__aatSessionBar) { return; }
    window.__aatSessionBar = true;

    var T = window.aatT || function (s) { return s; };
    var LANG = localStorage.getItem('aat_lang') || 'en';

    // Fiori apps: open them in the chosen language (UI5 reads sap-ui-language)
    var qs = new URLSearchParams(location.search);
    var isFiori = /\/aat\.admin\./.test(location.pathname);
    if (isFiori) {
        if (LANG === 'hi' && qs.get('sap-ui-language') !== 'hi') {
            qs.set('sap-ui-language', 'hi'); location.replace(location.pathname + '?' + qs.toString() + location.hash); return;
        }
        if (LANG !== 'hi' && qs.has('sap-ui-language')) {
            qs.delete('sap-ui-language'); var rest = qs.toString();
            location.replace(location.pathname + (rest ? '?' + rest : '') + location.hash); return;
        }
    }

    var style = document.createElement('style');
    style.textContent =
        '#aat-bar{position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:100000;font-family:"Segoe UI",system-ui,sans-serif;font-size:13px}' +
        '#aat-bar .pill{display:flex;align-items:center;gap:8px;background:#0B1F3A;color:#fff;border:1px solid #C9A227;border-radius:99px;padding:5px 14px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);font:inherit}' +
        '#aat-bar .pill:hover{background:#16315A}' +
        '#aat-menu{display:none;position:absolute;top:38px;left:50%;transform:translateX(-50%);min-width:260px;background:#fff;color:#1B2433;border-radius:12px;border-top:4px solid #C9A227;box-shadow:0 8px 24px rgba(11,31,58,.25);padding:10px 0;overflow:hidden}' +
        '#aat-menu.open{display:block}' +
        '#aat-menu .who{padding:6px 16px 10px;border-bottom:1px solid #EEF1F6;word-break:break-all}' +
        '#aat-menu .who small{display:block;color:#6B7686}' +
        '#aat-menu .role{display:inline-block;background:#F3E6B3;color:#7A5F00;border-radius:99px;padding:2px 9px;font-size:12px;font-weight:600;margin:6px 6px 0 0}' +
        '#aat-menu a{display:block;padding:9px 16px;color:#0B1F3A;text-decoration:none;cursor:pointer}' +
        '#aat-menu a:hover{background:#F6F4EE}' +
        '#aat-menu hr{border:0;border-top:1px solid #EEF1F6;margin:6px 0}';
    document.head.appendChild(style);

    var bar = document.createElement('div'); bar.id = 'aat-bar';
    var pill = document.createElement('button'); pill.type = 'button'; pill.className = 'pill'; pill.textContent = T('Checking sign-in…');
    var menu = document.createElement('div'); menu.id = 'aat-menu';
    bar.appendChild(pill); bar.appendChild(menu);

    function link(text, href, onclick) {
        var a = document.createElement('a'); a.textContent = text; a.href = href || '#';
        if (onclick) { a.addEventListener('click', function (e) { e.preventDefault(); onclick(); }); }
        return a;
    }
    function toggleLanguage() {
        localStorage.setItem('aat_lang', LANG === 'hi' ? 'en' : 'hi');
        location.reload();
    }
    function languageLink() { return link('🌐 ' + (LANG === 'hi' ? 'English' : 'हिन्दी'), '#', toggleLanguage); }

    function render(me, dev) {
        var roles = [];
        if (me.isAdmin) { roles.push(T('Admin')); }
        if (me.isUser) { roles.push(T('Adopter')); }
        pill.textContent = '👤 ' + String(me.id).split('@')[0] + ' · ' + (roles.join(' / ') || T('no role')) + ' ▾';
        pill.onclick = function (e) { e.stopPropagation(); menu.classList.toggle('open'); };
        menu.textContent = '';
        var who = document.createElement('div'); who.className = 'who';
        var s = document.createElement('small'); s.textContent = T('Signed in as'); who.appendChild(s);
        who.appendChild(document.createTextNode(me.id)); who.appendChild(document.createElement('br'));
        roles.forEach(function (r) { var b = document.createElement('span'); b.className = 'role'; b.textContent = r; who.appendChild(b); });
        menu.appendChild(who);
        menu.appendChild(link('🏠 ' + T('Home'), '/landing/index.html'));
        if (me.isAdmin) { menu.appendChild(link('📊 ' + T('Admin dashboard'), '/dashboard/index.html')); }
        if (me.isUser) { menu.appendChild(link('🐾 ' + T('Adopter portal'), '/portal/index.html')); }
        menu.appendChild(document.createElement('hr'));
        menu.appendChild(languageLink());
        menu.appendChild(link('🔁 ' + T('Switch user / role'), dev ? '/switch/index.html' : '/logout'));
        menu.appendChild(link('🚪 ' + T('Sign out'), '/logout'));
    }

    function renderSignedOut(dev) {
        pill.textContent = '🔑 ' + T('Sign in');
        pill.onclick = function () { location.href = dev ? '/switch/index.html' : '/landing/index.html'; };
    }

    function load() {
        fetch('/dev/users', { credentials: 'same-origin' }).then(function (r) { return r.ok; }, function () { return false; })
            .then(function (dev) {
                fetch('/odata/v4/session/me()', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
                    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
                    .then(function (me) { render(me, dev); })
                    .catch(function () { renderSignedOut(dev); });
            });
    }

    document.addEventListener('click', function () { menu.classList.remove('open'); });
    function mount() { document.body.appendChild(bar); load(); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', mount); } else { mount(); }
})();