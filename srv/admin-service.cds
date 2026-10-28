using aat from '../db/schema';

@path    : '/odata/v4/admin'
@requires: 'Admin'
service AdminService {

  entity Shelters             as projection on aat.Shelters
    actions {
      action setImageLink(url: String @title: '{i18n>imageLinkUrl}' ) returns Shelters;
    };

  entity Animals              as projection on aat.Animals
    actions {
      action changeAdoptionStatus(status: aat.AdoptionStatus)         returns Animals;
      action setPhotoLink(url: String @title: '{i18n>photoLinkUrl}' ) returns Animals;
    };

  entity Users                as projection on aat.Users;

  @restrict: [{
    grant: [
      'READ',
      'startReview',
      'approve',
      'reject'
    ],
    to   : 'Admin'
  }]
  entity AdoptionApplications as projection on aat.AdoptionApplications
    actions {
      action startReview()                           returns AdoptionApplications;
      action approve(remarks: String)                returns AdoptionApplications;
      action reject(reason: String, remarks: String) returns AdoptionApplications;
    };

  @readonly
  entity ApplicationDocuments as projection on aat.ApplicationDocuments;

  @readonly
  entity AuditLog             as projection on aat.AuditLog;

  @readonly
  entity ApplicationHistory   as projection on aat.ApplicationHistory;

  @restrict: [{
    grant: [
      'READ',
      'scheduleInspection',
      'addDocument'
    ],
    to   : 'Admin'
  }]
  entity Adoptions            as projection on aat.Adoptions
    actions {
      action scheduleInspection(inspectionDate: Date,
                                inspector: String,
                                inspectionType: String)                   returns Inspections;
      action addDocument(docType: String  @title: '{i18n>documentType}',
                         fileName: String @title: '{i18n>fileName}',
                         url: String      @title: '{i18n>documentLink}' ) returns Adoptions;
    };

  entity AdoptionDocuments    as projection on aat.AdoptionDocuments
    actions {
      action removeDocument();
    };

  entity HealthRecords        as projection on aat.HealthRecords
    actions {
      action scheduleCheckup(nextCheckupDate: Date)                       returns HealthRecords;
      action markRecovered()                                              returns HealthRecords;
      action addDocument(docType: String  @title: '{i18n>documentType}',
                         fileName: String @title: '{i18n>fileName}',
                         url: String      @title: '{i18n>documentLink}' ) returns HealthRecords;
    };

  entity HealthDocuments      as projection on aat.HealthDocuments
    actions {
      action removeDocument();
    };

  entity Inspections          as projection on aat.Inspections
    actions {
      action recordResult(result: aat.InspectionResult,
                          findings: String,
                          remarks: String)                                returns Inspections;
      action addDocument(docType: String  @title: '{i18n>documentType}',
                         fileName: String @title: '{i18n>fileName}',
                         url: String      @title: '{i18n>documentLink}' ) returns Inspections;
    };

  entity InspectionDocuments  as projection on aat.InspectionDocuments
    actions {
      action removeDocument();
    };

  type AnimalKPI {
    totalAnimals : Integer;
    available    : Integer;
    adopted      : Integer;
    unavailable  : Integer;
  }

  type StatusCount {
    status : String;
    count  : Integer;
  }

  type TrendPoint {
    period : String;
    count  : Integer;
  }

  type OccupancyRow {
    shelterName      : String;
    location         : String;
    currentOccupancy : Integer;
    totalCapacity    : Integer;
    occupancyPct     : Decimal(5, 2);
  }

  type UploadResult {
    url      : String;
    publicId : String;
    fileName : String;
  }

  action   uploadFile(kind: String, fileName: String, mediaType: String, content: LargeString) returns UploadResult;

  type PendingCounts {
    pendingApplications : Integer;
    pendingInspections  : Integer;
  }

  function getPendingCounts()                                                                  returns PendingCounts;

  function getAnimalSummary()                                                                  returns AnimalKPI;
  function getApplicationStatusDistribution()                                                  returns array of StatusCount;
  function getAdoptionTrend(months: Integer)                                                   returns array of TrendPoint;
  function getShelterOccupancy()                                                               returns array of OccupancyRow;
  function getOverdueCheckups()                                                                returns array of HealthRecords;


}

annotate AdminService.Animals with @odata.draft.enabled;
annotate AdminService.Shelters with @odata.draft.enabled;
annotate AdminService.HealthRecords with @odata.draft.enabled;
annotate AdminService.Inspections with @odata.draft.enabled;
annotate AdminService.Users with @odata.draft.enabled;
