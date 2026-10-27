using AdminService as service from '../../srv/admin-service';

annotate service.Animals with {
    animalId          @title: '{i18n>animalId}';
    name              @title: '{i18n>name}';
    species           @title: '{i18n>species}';
    breed             @title: '{i18n>breed}';
    gender            @title: '{i18n>gender}';
    age               @title: '{i18n>ageYears}';
    color             @title: '{i18n>colour}';
    arrivalDate       @title: '{i18n>arrivalDate}';
    shelter           @title: '{i18n>shelter}';
    healthStatus      @title: '{i18n>healthStatus}';
    vaccinationStatus @title: '{i18n>vaccinationStatus}';
    adoptionStatus    @title: '{i18n>adoptionStatus}';
    adoptionFee       @title: '{i18n>adoptionFee}';
    adoptionEligible  @title: '{i18n>eligibleForAdoption}';
    description       @title: '{i18n>description}';
    photoUrl          @title: '{i18n>photoLinkUrl}';
};

annotate service.Shelters with {
    shelterCode      @title: '{i18n>shelterId}';
    name             @title: '{i18n>shelterName}';
    address          @title: '{i18n>address}';
    city             @title: '{i18n>city}';
    state            @title: '{i18n>state}';
    pincode          @title: '{i18n>pincode}';
    phone            @title: '{i18n>phone}';
    email            @title: '{i18n>email}';
    capacity         @title: '{i18n>capacity}';
    status           @title: '{i18n>status}';
    openingTime      @title: '{i18n>openingTime}';
    closingTime      @title: '{i18n>closingTime}';
    currentOccupancy @title: '{i18n>currentOccupancy}';
    occupancyPct     @title: '{i18n>occupancy2}';
    imageUrl         @title: '{i18n>imageLinkUrl}'
};

annotate service.AdoptionApplications with {
    applicationNo   @title: '{i18n>applicationId}';
    animal          @title: '{i18n>animal}';
    applicant       @title: '{i18n>applicant}';
    applicationDate @title: '{i18n>appliedOn}';
    reason          @title: '{i18n>reasonForAdoption}';
    housingType     @title: '{i18n>housingType}';
    hasOtherPets    @title: '{i18n>hasOtherPets}';
    petExperience   @title: '{i18n>petExperience}';
    status          @title: '{i18n>status}';
    reviewedBy      @title: '{i18n>reviewedBy}';
    reviewedAt      @title: '{i18n>reviewedAt}';
    reviewerRemarks @title: '{i18n>reviewerRemarks}';
    rejectionReason @title: '{i18n>rejectionReason}';
};

annotate service.ApplicationHistory with {
    changedAt  @title: '{i18n>changedAt}';
    fromStatus @title: '{i18n>from}';
    toStatus   @title: '{i18n>to}';
    changedBy  @title: '{i18n>changedBy}';
    remarks    @title: '{i18n>remarks}';
};

annotate service.Adoptions with {
    adoptionNo   @title: '{i18n>adoptionId}';
    animal       @title: '{i18n>animal}';
    adopter      @title: '{i18n>adopter}';
    adoptionDate @title: '{i18n>adoptionDate}';
    status       @title: '{i18n>status}';
    remarks      @title: '{i18n>remarks}';
};

annotate service.HealthRecords with {
    animal            @title: '{i18n>animal}';
    checkupDate       @title: '{i18n>checkupDate}';
    diagnosis         @title: '{i18n>diagnosis}';
    treatment         @title: '{i18n>treatment}';
    medication        @title: '{i18n>medication}';
    veterinarian      @title: '{i18n>veterinarian}';
    weight            @title: '{i18n>weightKg}';
    healthStatus      @title: '{i18n>healthStatus}';
    vaccinationStatus @title: '{i18n>vaccinationStatus}';
    healthSummary     @title: '{i18n>healthSummary}';
    nextCheckupDate   @title: '{i18n>nextCheckup}';
    adoptionEligible  @title: '{i18n>eligibleForAdoption}';
    recovered         @title: '{i18n>recovered}';
};

annotate service.Inspections with {
    inspectionDate  @title: '{i18n>inspectionDate}';
    inspector       @title: '{i18n>inspector}';
    inspectionType  @title: '{i18n>type}';
    existingPets    @title: '{i18n>existingPets}';
    animalCondition @title: '{i18n>animalCondition}';
    result          @title: '{i18n>result}';
    remarks         @title: '{i18n>remarks}';
    adoption        @title: '{i18n>adoption}';
    animal          @title: '{i18n>animal}';
};

annotate service.ApplicationDocuments with {
    docType   @title: '{i18n>documentType}';
    fileName  @title: '{i18n>fileName}';
    size      @title: '{i18n>sizeBytes}';
    createdAt @title: '{i18n>uploadedOn}';
};

annotate service.AdoptionDocuments with {
    docType   @title: '{i18n>documentType}';
    fileName  @title: '{i18n>fileName}';
    size      @title: '{i18n>sizeBytes}';
    createdAt @title: '{i18n>uploadedOn}';
};

annotate service.HealthDocuments with {
    docType   @title: '{i18n>documentType}';
    fileName  @title: '{i18n>fileName}';
    size      @title: '{i18n>sizeBytes}';
    createdAt @title: '{i18n>uploadedOn}';
};

annotate service.InspectionDocuments with {
    docType   @title: '{i18n>documentType}';
    fileName  @title: '{i18n>fileName}';
    size      @title: '{i18n>sizeBytes}';
    createdAt @title: '{i18n>uploadedOn}';
};

// Health records are managed in the Health app, not inside an animal
annotate service.Animals with @Capabilities.NavigationRestrictions.RestrictedProperties: [{
    NavigationProperty: healthRecords,
    InsertRestrictions: {Insertable: false},
    UpdateRestrictions: {Updatable: false},
    DeleteRestrictions: {Deletable: false}
}];
