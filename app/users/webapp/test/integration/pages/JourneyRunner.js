sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"aat/admin/users/test/integration/pages/UsersList.gen",
	"aat/admin/users/test/integration/pages/UsersObjectPage.gen"
], function (JourneyRunner, UsersListGenerated, UsersObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('aat/admin/users') + '/test/flp.html#app-preview',
        pages: {
			onTheUsersListGenerated: UsersListGenerated,
			onTheUsersObjectPageGenerated: UsersObjectPageGenerated
        },
        async: true
    });

    return runner;
});

