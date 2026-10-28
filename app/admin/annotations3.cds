using AdminService as service from '../../srv/admin-service';

annotate service.AdoptionDocuments with @UI.LineItem: [
    {Value: docType},
    {
        $Type: 'UI.DataFieldWithUrl',
        Value: fileName,
        Url  : url,
        Label: '{i18n>file}'
    },
    {Value: createdAt},
    {
        $Type : 'UI.DataFieldForAction',
        Action: 'AdminService.removeDocument',
        Label : '{i18n>remove}'
    }
];

annotate service.HealthDocuments with @UI.LineItem: [
    {Value: docType},
    {
        $Type: 'UI.DataFieldWithUrl',
        Value: fileName,
        Url  : url,
        Label: '{i18n>file}'
    },
    {Value: createdAt},
    {
        $Type : 'UI.DataFieldForAction',
        Action: 'AdminService.removeDocument',
        Label : '{i18n>remove}'
    }
];

annotate service.InspectionDocuments with @UI.LineItem: [
    {Value: docType},
    {
        $Type: 'UI.DataFieldWithUrl',
        Value: fileName,
        Url  : url,
        Label: '{i18n>file}'
    },
    {Value: createdAt},
    {
        $Type : 'UI.DataFieldForAction',
        Action: 'AdminService.removeDocument',
        Label : '{i18n>remove}'
    }
];

annotate service.ApplicationDocuments with @UI.LineItem: [ // read-only for the Admin
    {Value: docType},
    {
        $Type: 'UI.DataFieldWithUrl',
        Value: fileName,
        Url  : url,
        Label: '{i18n>file}'
    },
    {Value: createdAt}
];

annotate service.AdoptionDocuments with {
    url @title: '{i18n>documentLink}';
};

annotate service.HealthDocuments with {
    url @title: '{i18n>documentLink}';
};

annotate service.InspectionDocuments with {
    url @title: '{i18n>documentLink}';
};

annotate service.ApplicationDocuments with {
    url @title: '{i18n>documentLink}';
};

// Documents are added and removed with the buttons, not by typing into the table
annotate service.Adoptions with @Capabilities.NavigationRestrictions.RestrictedProperties: [{
    NavigationProperty: documents,
    InsertRestrictions: {Insertable: false},
    UpdateRestrictions: {Updatable: false},
    DeleteRestrictions: {Deletable: false}
}];

annotate service.HealthRecords with @Capabilities.NavigationRestrictions.RestrictedProperties: [{
    NavigationProperty: documents,
    InsertRestrictions: {Insertable: false},
    UpdateRestrictions: {Updatable: false},
    DeleteRestrictions: {Deletable: false}
}];

annotate service.Inspections with @Capabilities.NavigationRestrictions.RestrictedProperties: [{
    NavigationProperty: documents,
    InsertRestrictions: {Insertable: false},
    UpdateRestrictions: {Updatable: false},
    DeleteRestrictions: {Deletable: false}
}];

annotate service.Adoptions with @cds.odata.valuelist;
annotate service.Animals with @cds.odata.valuelist;

annotate service.Animals with @UI.FieldGroup #Admin: {Data: [
    {Value: createdAt},
    {Value: createdBy},
    {Value: modifiedAt},
    {Value: modifiedBy}
]};

annotate service.AuditLog with @(
    UI.Facets           : [{
        $Type : 'UI.ReferenceFacet',
        Label : '{i18n>details}',
        Target: '@UI.FieldGroup#Audit'
    }],
    UI.FieldGroup #Audit: {Data: [
        {Value: timestamp},
        {Value: entity},
        {Value: action},
        {Value: userId},
        {Value: entityKey},
        {Value: details}
    ]}
);

annotate service.AuditLog with {
    details @UI.MultiLineText;
};
