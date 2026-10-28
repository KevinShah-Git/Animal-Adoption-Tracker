namespace aat;

using {
  cuid,
  managed
} from '@sap/cds/common';

// ---------- Enumerations ----------
type HealthStatus      : String enum {
  Healthy;
  Sick;
  Injured;
  UnderTreatment = 'Under Treatment';
  Critical;
};

type VaccinationStatus : String enum {
  Vaccinated;
  PartiallyVaccinated = 'Partially Vaccinated';
  NotVaccinated = 'Not Vaccinated';
};

type AdoptionStatus    : String enum {
  Available;
  Reserved;
  Adopted;
  UnderTreatment = 'Under Treatment';
};

type ApplicationStatus : String enum {
  Submitted;
  UnderReview = 'Under Review';
  Approved;
  Rejected;
  Withdrawn;
};

type AdoptionRecStatus : String enum {
  Active;
  Completed;
  Cancelled;
};

type InspectionResult  : String enum {
  Scheduled;
  Validated;
  FollowUpRequired = 'Follow-up Required';
  Failed;
};

type ShelterStatus     : String enum {
  Active;
  Inactive;
};

type UserRole          : String enum {
  Admin;
  User;
};

// ---------- Reusable attachment aspect (Cloudinary metadata) ----------
aspect Attachment : cuid, managed {
  docType      : String(40); // Certificate, Agreement, MedicalReport, HousingProof ...
  fileName     : String(255);
  mediaType    : String(100);
  size         : Integer;
  url          : String(500); // Cloudinary secure_url
  publicId     : String(255); // needed for delete / signed URL
  resourceType : String(20); // image | raw
  format       : String(10);
  isPrivate    : Boolean default true;
}

// ---------- Core entities ----------
entity Shelters : cuid, managed {
  shelterCode              : String(12)  @readonly;
  name                     : String(100) @mandatory;
  address                  : String(255);
  city                     : String(60);
  state                    : String(60);
  pincode                  : String(10);
  phone                    : String(20);
  email                    : String(100);
  capacity                 : Integer     @mandatory;
  openingTime              : Time;
  closingTime              : Time;
  status                   : ShelterStatus default 'Active';
  imageUrl                 : String(500);
  imagePublicId            : String(255);
  virtual currentOccupancy : Integer; // computed in handler
  virtual occupancyPct     : Decimal(5, 2); // computed in handler
  animals                  : Association to many Animals
                               on animals.shelter = $self;
}

entity Animals : cuid, managed {
  animalId          : String(12)              @readonly; // ANI-0001 (auto)
  shelter           : Association to Shelters @mandatory;
  name              : String(100)             @mandatory;
  species           : String(40)              @mandatory;
  breed             : String(60);
  gender            : String enum {
    Male;
    Female;
    Unknown
  };
  age               : Decimal(4, 1);
  color             : String(40);
  arrivalDate       : Date;
  healthStatus      : HealthStatus default 'Healthy';
  vaccinationStatus : VaccinationStatus default #NotVaccinated;
  adoptionStatus    : AdoptionStatus default 'Available';
  adoptionFee       : Decimal(10, 2) default 0;
  photoUrl          : String(500);
  photoPublicId     : String(255);
  description       : String(1000);
  adoptionEligible  : Boolean default false;
  healthRecords     : Association to many HealthRecords
                        on healthRecords.animal = $self;
}

entity Users : cuid, managed {
  userId    : String(12)  @readonly;
  firstName : String(60)  @mandatory;
  lastName  : String(60)  @mandatory;
  email     : String(100) @mandatory;
  phone     : String(20);
  address   : String(255);
  city      : String(60);
  state     : String(60);
  pincode   : String(10);
  role      : UserRole default 'User';
  status    : String enum {
    Active;
    Inactive
  } default 'Active';
}

entity AdoptionApplications : cuid, managed {
  applicationNo   : String(14)             @readonly;
  animal          : Association to Animals @mandatory;
  applicant       : Association to Users;
  applicationDate : Date;
  reason          : String(1000)           @mandatory;
  housingType     : String enum {
    Apartment;
    IndependentHouse = 'Independent House';
    Farm;
    Other
  };
  hasOtherPets    : Boolean;
  petExperience   : String(500);
  status          : ApplicationStatus default 'Submitted';
  reviewedBy      : String(100);
  reviewedAt      : Timestamp;
  reviewerRemarks : String(500);
  rejectionReason : String(500);
  documents       : Composition of many ApplicationDocuments
                      on documents.application = $self;
  history         : Composition of many ApplicationHistory
                      on history.application = $self;
}

entity ApplicationDocuments : Attachment {
  application : Association to AdoptionApplications;
}

entity ApplicationHistory : cuid {
  application : Association to AdoptionApplications;
  fromStatus  : String(20);
  toStatus    : String(20);
  changedBy   : String(100);
  changedAt   : Timestamp;
  remarks     : String(500);
}

entity Adoptions : cuid, managed {
  adoptionNo   : String(12) @readonly;
  application  : Association to AdoptionApplications; // 1 application -> 1 adoption
  animal       : Association to Animals;
  adopter      : Association to Users;
  adoptionDate : Date;
  status       : AdoptionRecStatus default 'Active';
  remarks      : String(500);
  documents    : Composition of many AdoptionDocuments
                   on documents.adoption = $self;
  inspections  : Composition of many Inspections
                   on inspections.adoption = $self;
}

entity AdoptionDocuments : Attachment {
  adoption : Association to Adoptions;
}

entity HealthRecords : cuid, managed {
  animal                     : Association to Animals @mandatory;
  checkupDate                : Date;
  diagnosis                  : String(500);
  treatment                  : String(500);
  medication                 : String(300);
  veterinarian               : String(100);
  weight                     : Decimal(6, 2);
  healthStatus               : HealthStatus;
  vaccinationStatus          : VaccinationStatus;
  healthSummary              : String(1000);
  nextCheckupDate            : Date;
  adoptionEligible           : Boolean;
  recovered                  : Boolean default false;
  virtual checkupCriticality : Integer;
  documents                  : Composition of many HealthDocuments
                                 on documents.healthRecord = $self;
}

entity HealthDocuments : Attachment {
  healthRecord : Association to HealthRecords;
}

entity Inspections : cuid, managed {
  adoption        : Association to Adoptions @mandatory;
  animal          : Association to Animals;
  inspectionDate  : Date                     @mandatory;
  inspector       : String(100);
  inspectionType  : String enum {
    HomeVisit = 'Home Visit';
    PhoneFollowUp = 'Phone Follow-up';
    VideoCall = 'Video Call'
  };
  existingPets    : Integer;
  animalCondition : String(300);
  result          : InspectionResult default 'Scheduled';
  remarks         : String(500);
  documents       : Composition of many InspectionDocuments
                      on documents.inspection = $self;
}

entity InspectionDocuments : Attachment {
  inspection : Association to Inspections;
}

// ---------- Audit (NFR-006) ----------
entity AuditLog : cuid {
  entity    : String(40);
  entityKey : String(40);
  action    : String(30);
  userId    : String(100);
  timestamp : Timestamp;
  details   : LargeString;
}
