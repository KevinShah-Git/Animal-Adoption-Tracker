const cds = require('@sap/cds');

module.exports = class SessionService extends cds.ApplicationService {
    init() {
        this.on('me', req => ({
            id: req.user.id,
            isAdmin: req.user.is('Admin'),
            isUser: req.user.is('User')
        }));
        return super.init();
    }
};