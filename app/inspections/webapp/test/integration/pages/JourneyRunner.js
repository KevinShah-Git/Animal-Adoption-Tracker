sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/inspections/test/integration/pages/InspectionsList.gen",
	"aat/admin/inspections/test/integration/pages/InspectionsObjectPage.gen"
], function (JourneyRunner, InspectionsListGenerated, InspectionsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/inspections') + '/test/flp.html#app-preview',
        pages: {
			onTheInspectionsListGenerated: InspectionsListGenerated,
			onTheInspectionsObjectPageGenerated: InspectionsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

