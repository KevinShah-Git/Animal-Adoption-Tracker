sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/adoptions/test/integration/pages/AdoptionsList.gen",
	"aat/admin/adoptions/test/integration/pages/AdoptionsObjectPage.gen"
], function (JourneyRunner, AdoptionsListGenerated, AdoptionsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/adoptions') + '/test/flp.html#app-preview',
        pages: {
			onTheAdoptionsListGenerated: AdoptionsListGenerated,
			onTheAdoptionsObjectPageGenerated: AdoptionsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

