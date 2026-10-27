sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/animals/test/integration/pages/AnimalsList.gen",
	"aat/admin/animals/test/integration/pages/AnimalsObjectPage.gen"
], function (JourneyRunner, AnimalsListGenerated, AnimalsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/animals') + '/test/flp.html#app-preview',
        pages: {
			onTheAnimalsListGenerated: AnimalsListGenerated,
			onTheAnimalsObjectPageGenerated: AnimalsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

