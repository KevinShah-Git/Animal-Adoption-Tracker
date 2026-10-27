const cds = require('@sap/cds');

const USER = 'aat_dev_user';   // which test login the browser is using
const OUT = 'aat_dev_out';     // set after "Sign out" so a cached browser login is ignored

cds.on('bootstrap', app => {
    if (process.env.NODE_ENV === 'production') return;      // on BTP the approuter handles login and logout

    const users = () => Object.fromEntries(
        Object.entries((cds.env.requires && cds.env.requires.auth && cds.env.requires.auth.users) || {})
            .filter(([id, u]) => id.includes('@') && u && typeof u === 'object')); const cookies = h => Object.fromEntries(String(h || '').split(';').map(s => s.trim()).filter(Boolean)
                .map(s => { const i = s.indexOf('='); return [s.slice(0, i), decodeURIComponent(s.slice(i + 1))]; }));
    const opts = { httpOnly: true, sameSite: 'lax', path: '/' };

    // list of test logins for the switch page
    app.get('/dev/users', (req, res) =>
        res.json(Object.entries(users()).map(([id, u]) => ({ id, roles: u.roles || [] }))));

    app.get('/dev/login', (req, res) => {
        const id = String(req.query.user || '');
        if (!users()[id]) return res.status(400).send('Unknown user');
        res.clearCookie(OUT, { path: '/' });
        res.cookie(USER, id, opts);
        const next = String(req.query.next || '/landing/index.html');
        res.redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/landing/index.html');
    });

    app.get('/logout', (req, res) => {
        res.clearCookie(USER, { path: '/' });
        res.cookie(OUT, '1', opts);
        res.redirect('/switch/index.html');
    });

    // Apply the chosen test login to every request (before CAP checks it)
    app.use((req, res, next) => {
        const c = cookies(req.headers.cookie);
        const u = users()[c[USER]];
        if (u && u.password !== undefined) {
            req.headers.authorization = 'Basic ' + Buffer.from(c[USER] + ':' + u.password).toString('base64');
        } else if (c[OUT]) {
            delete req.headers.authorization;
        }
        if (u || c[OUT]) {                                     // browser calls: never pop up the browser login box
            const writeHead = res.writeHead;
            res.writeHead = function (code, ...rest) {
                if (code === 401) this.removeHeader('WWW-Authenticate');
                return writeHead.call(this, code, ...rest);
            };
        }
        next();
    });
});