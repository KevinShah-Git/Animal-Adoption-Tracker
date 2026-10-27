sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/auditlog/test/integration/pages/AuditLogList.gen",
	"aat/admin/auditlog/test/integration/pages/AuditLogObjectPage.gen"
], function (JourneyRunner, AuditLogListGenerated, AuditLogObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/auditlog') + '/test/flp.html#app-preview',
        pages: {
			onTheAuditLogListGenerated: AuditLogListGenerated,
			onTheAuditLogObjectPageGenerated: AuditLogObjectPageGenerated
        },
        async: true
    });

    return runner;
});

