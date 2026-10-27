sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/applications/test/integration/pages/AdoptionApplicationsList.gen",
	"aat/admin/applications/test/integration/pages/AdoptionApplicationsObjectPage.gen"
], function (JourneyRunner, AdoptionApplicationsListGenerated, AdoptionApplicationsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/applications') + '/test/flp.html#app-preview',
        pages: {
			onTheAdoptionApplicationsListGenerated: AdoptionApplicationsListGenerated,
			onTheAdoptionApplicationsObjectPageGenerated: AdoptionApplicationsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

