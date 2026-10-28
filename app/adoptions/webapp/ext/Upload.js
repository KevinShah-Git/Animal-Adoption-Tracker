sap.ui.define(["aat/admin/adoptions/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = {"mode":"document","entity":"Adoptions","draft":false,"action":"addDocument","kind":"document","accept":"application/pdf,image/png,image/jpeg","docTypes":["Agreement","Certificate","Supporting Document"]};
  return {
    onUploadDoc: function () { Core.start(cfg); }
  };
});
