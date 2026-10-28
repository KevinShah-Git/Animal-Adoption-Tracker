using AdminService as service from '../../srv/admin-service';

annotate service.Shelters with @cds.odata.valuelist;

annotate service.Animals with {
    shelter @(
        Common.Text           : shelter.name,
        Common.TextArrangement: #TextOnly
    );
};

// ---------- ANIMALS ----------
annotate service.Animals with @(
    UI.HeaderInfo         : {
        TypeName      : '{i18n>animal}',
        TypeNamePlural: '{i18n>animals}',
        Title         : {Value: name},
        Description   : {Value: animalId},
        ImageUrl      : photoUrl
    },
    UI.SelectionFields    : [
        shelter_ID,
        species,
        adoptionStatus,
        healthStatus
    ],
    UI.LineItem           : [
        {
            Value: animalId,
            Label: '{i18n>id}'
        },
        {Value: name},
        {Value: species},
        {Value: breed},
        {
            Value: shelter_ID,
            Label: '{i18n>shelter}'
        },
        {Value: healthStatus},
        {Value: vaccinationStatus},
        {Value: adoptionStatus},
        {Value: adoptionFee}
    ],
    UI.Identification     : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.changeAdoptionStatus',
            Label : '{i18n>changeAdoptionStatus}'
        }
    ],
    UI.Facets             : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>general}',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>healthAdoption}',
            Target: '@UI.FieldGroup#Health'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>healthHistory}',
            Target: 'healthRecords/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Administrative}',
            Target: '@UI.FieldGroup#Admin'
        }
    ],
    UI.FieldGroup #General: {Data: [
        {Value: name},
        {Value: species},
        {Value: breed},
        {Value: gender},
        {Value: age},
        {Value: color},
        {Value: shelter_ID},
        {Value: arrivalDate},
        {Value: description},
        {Value: photoUrl}
    ]},
    UI.FieldGroup #Health : {Data: [
        {Value: healthStatus},
        {Value: vaccinationStatus},
        {Value: adoptionStatus},
        {Value: adoptionFee},
        {Value: adoptionEligible}
    ]}
);

// ---------- ADOPTION APPLICATIONS ----------
annotate service.AdoptionApplications with {
    animal    @(
        Common.Text           : animal.name,
        Common.TextArrangement: #TextOnly
    );
    applicant @(
        Common.Text           : applicant.firstName,
        Common.TextArrangement: #TextOnly
    );
};

annotate service.AdoptionApplications with @(
    UI.HeaderInfo           : {
        TypeName      : '{i18n>application}',
        TypeNamePlural: '{i18n>applications}',
        Title         : {Value: applicationNo},
        Description   : {Value: status}
    },
    UI.SelectionFields      : [
        status,
        applicationDate,
        animal_ID
    ],
    UI.LineItem             : [
        {
            Value: applicationNo,
            Label: '{i18n>applicationId}'
        },
        {
            Value: applicant_ID,
            Label: '{i18n>applicant}'
        },
        {
            Value: animal_ID,
            Label: '{i18n>animal}'
        },
        {Value: status},
        {Value: applicationDate}
    ],
    UI.Identification       : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.startReview',
            Label : '{i18n>startReview}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.approve',
            Label : '{i18n>approve}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.reject',
            Label : '{i18n>reject}'
        }
    ],
    UI.Facets               : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>applicant}',
            Target: '@UI.FieldGroup#Applicant'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>animal}',
            Target: '@UI.FieldGroup#Animal'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>housing}',
            Target: '@UI.FieldGroup#Housing'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>staffRemarks}',
            Target: '@UI.FieldGroup#Review'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>documents}',
            Target: 'documents/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>reviewHistory}',
            Target: 'history/@UI.LineItem'
        }
    ],
    UI.FieldGroup #Applicant: {Data: [
        {Value: applicant.firstName},
        {Value: applicant.lastName},
        {Value: applicant.email},
        {Value: applicant.phone}
    ]},
    UI.FieldGroup #Animal   : {Data: [
        {Value: animal.animalId},
        {Value: animal.name},
        {Value: animal.species},
        {Value: animal.adoptionStatus}
    ]},
    UI.FieldGroup #Housing  : {Data: [
        {Value: reason},
        {Value: housingType},
        {Value: hasOtherPets},
        {Value: petExperience}
    ]},
    UI.FieldGroup #Review   : {Data: [
        {Value: reviewedBy},
        {Value: reviewedAt},
        {Value: reviewerRemarks},
        {Value: rejectionReason}
    ]}
);

annotate service.ApplicationHistory with @UI.LineItem: [
    {Value: changedAt},
    {Value: fromStatus},
    {Value: toStatus},
    {Value: changedBy},
    {Value: remarks}
];

// ---------- SHELTERS ----------
annotate service.Shelters with @(
    UI.HeaderInfo          : {
        TypeName      : '{i18n>shelter}',
        TypeNamePlural: '{i18n>shelters}',
        Title         : {Value: name},
        Description   : {Value: shelterCode},
        ImageUrl      : imageUrl
    },
    UI.SelectionFields     : [
        city,
        status
    ],
    UI.DataPoint #occupancy: {
        Value        : currentOccupancy,
        TargetValue  : capacity,
        Visualization: #Progress,
        Title        : 'Occupancy'
    },
    UI.LineItem            : [
        {
            Value: shelterCode,
            Label: '{i18n>id}'
        },
        {Value: name},
        {Value: city},
        {Value: capacity},
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target: '@UI.DataPoint#occupancy',
            Label : '{i18n>occupancy}'
        },
        {Value: status}
    ],
    UI.Identification      : [],
    UI.Facets              : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>details}',
            Target: '@UI.FieldGroup#Details'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>capacity}',
            Target: '@UI.FieldGroup#Capacity'
        }
    ],
    UI.FieldGroup #Details : {Data: [
        {Value: name},
        {Value: address},
        {Value: city},
        {Value: state},
        {Value: pincode},
        {Value: phone},
        {Value: email},
        {Value: status},
        {Value: imageUrl}
    ]},
    UI.FieldGroup #Capacity: {Data: [
        {Value: capacity},
        {Value: currentOccupancy},
        {Value: occupancyPct},
        {Value: openingTime},
        {Value: closingTime}
    ]}
);

// ---------- HEALTH RECORDS ----------
annotate service.HealthRecords with {
    animal @(
        Common.Text           : animal.name,
        Common.TextArrangement: #TextOnly
    );
};

annotate service.HealthRecords with @(
    UI.HeaderInfo           : {
        TypeName      : '{i18n>healthRecord}',
        TypeNamePlural: '{i18n>healthRecords}',
        Title         : {Value: animal.name},
        Description   : {Value: checkupDate}
    },
    UI.SelectionFields      : [
        animal_ID,
        healthStatus,
        nextCheckupDate
    ],
    UI.LineItem             : [
        {
            Value: animal_ID,
            Label: '{i18n>animal}'
        },
        {Value: checkupDate},
        {Value: diagnosis},
        {Value: healthStatus},
        {Value: vaccinationStatus},
        {
            Value      : nextCheckupDate,
            Criticality: checkupCriticality
        },
        {Value: recovered},
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.scheduleCheckup',
            Label : '{i18n>scheduleCheckup}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.markRecovered',
            Label : '{i18n>markRecovered}'
        }
    ],
    UI.Identification       : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.scheduleCheckup',
            Label : '{i18n>scheduleCheckup}'
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.markRecovered',
            Label : '{i18n>markRecovered}'
        }
    ],
    UI.Facets               : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>checkup}',
            Target: '@UI.FieldGroup#Checkup'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>treatment}',
            Target: '@UI.FieldGroup#Treatment'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>documents}',
            Target: 'documents/@UI.LineItem'
        }
    ],
    UI.FieldGroup #Checkup  : {Data: [
        {Value: animal_ID},
        {Value: checkupDate},
        {Value: veterinarian},
        {Value: weight},
        {Value: healthStatus},
        {Value: vaccinationStatus},
        {Value: nextCheckupDate},
        {Value: adoptionEligible}
    ]},
    UI.FieldGroup #Treatment: {Data: [
        {Value: diagnosis},
        {Value: treatment},
        {Value: medication},
        {Value: healthSummary}
    ]}
);


// ---------- ADOPTIONS (read-only) + INSPECTIONS ----------
annotate service.Adoptions with {
    animal  @(
        Common.Text           : animal.name,
        Common.TextArrangement: #TextOnly
    );
    adopter @(
        Common.Text           : adopter.firstName,
        Common.TextArrangement: #TextOnly
    );
};

annotate service.Adoptions with @(
    UI.HeaderInfo          : {
        TypeName      : '{i18n>adoption}',
        TypeNamePlural: '{i18n>adoptions}',
        Title         : {Value: adoptionNo},
        Description   : {Value: status}
    },
    UI.SelectionFields     : [
        status,
        adoptionDate
    ],
    UI.LineItem            : [
        {Value: adoptionNo},
        {
            Value: animal_ID,
            Label: '{i18n>animal}'
        },
        {
            Value: adopter_ID,
            Label: '{i18n>adopter}'
        },
        {Value: adoptionDate},
        {Value: status}
    ],
    UI.Identification      : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'AdminService.scheduleInspection',
            Label : '{i18n>scheduleInspection}'
        }
    ],
    UI.Facets              : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>adoption}',
            Target: '@UI.FieldGroup#Adoption'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>inspections}',
            Target: 'inspections/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>documents}',
            Target: 'documents/@UI.LineItem'
        }
    ],
    UI.FieldGroup #Adoption: {Data: [
        {Value: animal_ID},
        {Value: adopter_ID},
        {Value: adoptionDate},
        {Value: status},
        {Value: remarks}
    ]}
);

annotate service.Inspections with @UI.LineItem: [
    {Value: inspectionDate},
    {Value: inspector},
    {Value: inspectionType},
    {Value: result},
    {Value: remarks},
    {
        $Type : 'UI.DataFieldForAction',
        Action: 'AdminService.recordResult',
        Label : '{i18n>recordResult}'
    }
];
