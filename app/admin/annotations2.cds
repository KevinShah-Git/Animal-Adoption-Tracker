using AdminService as service from '../../srv/admin-service';

// ---------- INSPECTIONS ----------
annotate service.Inspections with {
    adoption @(
        Common.Text           : adoption.adoptionNo,
        Common.TextArrangement: #TextOnly
    );
    animal   @(
        Common.Text           : animal.name,
        Common.TextArrangement: #TextOnly
    );
};

annotate service.Inspections with @(
    UI.HeaderInfo            : {
        TypeName      : '{i18n>inspection}',
        TypeNamePlural: '{i18n>inspections}',
        Title         : {Value: inspectionType},
        Description   : {Value: inspectionDate}
    },
    UI.SelectionFields       : [
        result,
        inspectionDate,
        inspectionType
    ],
    UI.Identification        : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.recordResult',
            Label : '{i18n>recordResult}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.addDocument',
            Label : '{i18n>addDocument}'
        }
    ],
    UI.Facets                : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>inspection}',
            Target: '@UI.FieldGroup#Inspection'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>documents}',
            Target: 'documents/@UI.LineItem'
        }
    ],
    UI.FieldGroup #Inspection: {Data: [
        {Value: adoption_ID},
        {Value: animal_ID},
        {Value: inspectionDate},
        {Value: inspector},
        {Value: inspectionType},
        {Value: existingPets},
        {Value: animalCondition},
        {Value: result},
        {Value: remarks}
    ]}
);

// ---------- USERS ----------
annotate service.Users with {
    userId    @title: '{i18n>userId}';
    firstName @title: '{i18n>firstName}';
    lastName  @title: '{i18n>lastName}';
    email     @title: '{i18n>email}';
    phone     @title: '{i18n>phone}';
    address   @title: '{i18n>address}';
    city      @title: '{i18n>city}';
    state     @title: '{i18n>state}';
    pincode   @title: '{i18n>pincode}';
    role      @title: '{i18n>role}';
    status    @title: '{i18n>status}';
};

annotate service.Users with @(
    UI.HeaderInfo         : {
        TypeName      : '{i18n>user}',
        TypeNamePlural: '{i18n>users}',
        Title         : {Value: email},
        Description   : {Value: userId}
    },
    UI.SelectionFields    : [
        role,
        status,
        city
    ],
    UI.LineItem           : [
        {Value: userId},
        {Value: firstName},
        {Value: lastName},
        {Value: email},
        {Value: phone},
        {Value: city},
        {Value: role},
        {Value: status}
    ],
    UI.Facets             : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>profile}',
            Target: '@UI.FieldGroup#Profile'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>address}',
            Target: '@UI.FieldGroup#Address'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>access}',
            Target: '@UI.FieldGroup#Access'
        }
    ],
    UI.FieldGroup #Profile: {Data: [
        {Value: firstName},
        {Value: lastName},
        {Value: email},
        {Value: phone}
    ]},
    UI.FieldGroup #Address: {Data: [
        {Value: address},
        {Value: city},
        {Value: state},
        {Value: pincode}
    ]},
    UI.FieldGroup #Access : {Data: [
        {Value: role},
        {Value: status}
    ]}
);

// ---------- AUDIT LOG ----------
annotate service.AuditLog with {
    entity    @title: '{i18n>entity}';
    entityKey @title: '{i18n>recordKey}';
    action    @title: '{i18n>action}';
    userId    @title: '{i18n>user}';
    timestamp @title: '{i18n>when}';
    details   @title: '{i18n>details}';
};

annotate service.AuditLog with @(
    UI.HeaderInfo         : {
        TypeName      : '{i18n>auditEntry}',
        TypeNamePlural: '{i18n>auditLog}',
        Title         : {Value: action},
        Description   : {Value: entity}
    },
    UI.SelectionFields    : [
        entity,
        action,
        userId
    ],
    UI.PresentationVariant: {
        SortOrder     : [{
            $Type     : 'Common.SortOrderType',
            Property  : timestamp,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem']
    },
    UI.LineItem           : [
        {Value: timestamp},
        {Value: entity},
        {Value: action},
        {Value: userId},
        {Value: entityKey},
        {Value: details}
    ]
);
