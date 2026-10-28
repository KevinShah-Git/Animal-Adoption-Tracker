sap.ui.define(["aat/admin/health/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = {"mode":"document","entity":"HealthRecords","draft":true,"action":"addDocument","kind":"document","accept":"application/pdf,image/png,image/jpeg","docTypes":["Certificate","Medical Report","Lab Result"]};
  return {
    onUploadDoc: function () { Core.start(cfg); }
  };
});
