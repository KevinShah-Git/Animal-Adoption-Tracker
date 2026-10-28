sap.ui.define(["aat/admin/shelters/ext/UploadCore"], function (Core) {
  "use strict";
  var cfg = {"mode":"photo","entity":"Shelters","draft":true,"action":"setImageLink","kind":"shelter","accept":"image/png,image/jpeg"};
  return {
    onUploadImage: function () { Core.start(cfg); }
  };
});
