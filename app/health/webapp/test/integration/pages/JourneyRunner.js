sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/health/test/integration/pages/HealthRecordsList.gen",
	"aat/admin/health/test/integration/pages/HealthRecordsObjectPage.gen"
], function (JourneyRunner, HealthRecordsListGenerated, HealthRecordsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/health') + '/test/flp.html#app-preview',
        pages: {
			onTheHealthRecordsListGenerated: HealthRecordsListGenerated,
			onTheHealthRecordsObjectPageGenerated: HealthRecordsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

