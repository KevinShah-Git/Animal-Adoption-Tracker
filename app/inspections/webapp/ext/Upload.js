sap.ui.define(["aat/admin/inspections/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = {"mode":"document","entity":"Inspections","draft":true,"action":"addDocument","kind":"document","accept":"application/pdf,image/png,image/jpeg","docTypes":["Inspection Report","Photo Evidence","Certificate"]};
  return {
    onUploadDoc: function () { Core.start(cfg); }
  };
});
