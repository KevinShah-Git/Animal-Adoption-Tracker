sap.ui.define(["aat/admin/animals/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = {"mode":"photo","entity":"Animals","draft":true,"action":"setPhotoLink","kind":"animal","accept":"image/png,image/jpeg"};
  return {
    onUploadPhoto: function () { Core.start(cfg); }
  };
});
