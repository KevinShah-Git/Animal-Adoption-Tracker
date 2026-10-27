sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/shelters/test/integration/pages/SheltersList.gen",
	"aat/admin/shelters/test/integration/pages/SheltersObjectPage.gen"
], function (JourneyRunner, SheltersListGenerated, SheltersObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/shelters') + '/test/flp.html#app-preview',
        pages: {
			onTheSheltersListGenerated: SheltersListGenerated,
			onTheSheltersObjectPageGenerated: SheltersObjectPageGenerated
        },
        async: true
    });

    return runner;
});

