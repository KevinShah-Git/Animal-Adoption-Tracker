using aat from '../db/schema';

@path    : '/odata/v4/user'
@requires: 'User'
service UserService {

  @readonly
  entity Animals              as
    select from aat.Animals {
      ID,
      animalId,
      name,
      species,
      breed,
      gender,
      age,
      color,
      photoUrl,
      description,
      adoptionFee,
      adoptionStatus,
      healthStatus,
      vaccinationStatus,
      adoptionEligible,
      shelter
    };

  @readonly
  entity Shelters             as
    select from aat.Shelters {
      ID,
      name,
      address,
      city,
      phone,
      email,
      openingTime,
      closingTime,
      status,
      imageUrl
    };

  @readonly
  entity HealthRecords        as
    select from aat.HealthRecords {
      ID,
      animal,
      checkupDate,
      healthStatus,
      vaccinationStatus,
      healthSummary,
      nextCheckupDate,
      adoptionEligible
    };

  @readonly
  entity HealthDocuments      as
    select from aat.HealthDocuments {
      ID,
      healthRecord,
      docType,
      fileName,
      url
    }
    where
      docType = 'Certificate';

  @restrict: [
    {
      grant: [
        'READ',
        'UPDATE',
        'DELETE'
      ],
      to   : 'User',
      where: 'email = $user'
    },
    {
      grant: 'CREATE',
      to   : 'User'
    }
  ]
  entity Users                as projection on aat.Users;

  @restrict: [
    {
      grant: [
        'READ',
        'UPDATE',
        'withdraw'
      ],
      to   : 'User',
      where: 'applicant.email = $user'
    },
    {
      grant: 'CREATE',
      to   : 'User'
    }
  ]
  entity AdoptionApplications as projection on aat.AdoptionApplications
    actions {
      action withdraw() returns AdoptionApplications;
    };

  @restrict: [{
    grant: 'READ',
    to   : 'User',
    where: 'application.applicant.email = $user'
  }]
  entity ApplicationDocuments as projection on aat.ApplicationDocuments;

  @restrict: [{
    grant: 'READ',
    to   : 'User',
    where: 'application.applicant.email = $user'
  }]
  entity ApplicationHistory   as projection on aat.ApplicationHistory;

  @restrict: [{
    grant: 'READ',
    to   : 'User',
    where: 'adopter.email = $user'
  }]
  entity Adoptions            as projection on aat.Adoptions;

  @restrict: [{
    grant: 'READ',
    to   : 'User',
    where: 'adoption.adopter.email = $user'
  }]
  entity AdoptionDocuments    as projection on aat.AdoptionDocuments;

  @restrict: [{
    grant: 'READ',
    to   : 'User',
    where: 'adoption.adopter.email = $user'
  }]
  entity Inspections          as
    select from aat.Inspections {
      ID,
      adoption,
      animal,
      inspectionDate,
      inspectionType,
      result,
      remarks
    };

  action registerProfile()                                                                           returns Users;

  action addApplicationDocument(applicationID: UUID, docType: String, fileName: String, url: String) returns String;

  type UploadResult {
    url      : String;
    publicId : String;
    fileName : String;
  }

  action uploadFile(fileName: String, mediaType: String, content: LargeString)                       returns UploadResult;

}
