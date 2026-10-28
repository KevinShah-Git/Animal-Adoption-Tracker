sap.ui.define([
    "sap/m/Dialog", "sap/m/Button", "sap/m/Select", "sap/m/Input", "sap/m/Label", "sap/m/VBox",
    "sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/core/Item", "sap/ui/core/BusyIndicator"
], function (Dialog, Button, Select, Input, Label, VBox, MessageBox, MessageToast, Item, BusyIndicator) {
    "use strict";

    var API = "/odata/v4/admin/";
    var MAX_BYTES = 10 * 1024 * 1024;
    var ALLOWED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    var csrf = null;

    // The record on screen is read from the page address, so it works whatever the framework passes to the button.
    function currentRecord() {
        var m = /\((?:ID=)?([0-9a-fA-F-]{36})(?:,IsActiveEntity=(true|false))?\)/.exec(decodeURIComponent(location.hash));
        return m ? { id: m[1], active: m[2] !== "false" } : null;
    }
    function pickFile(accept) {
        return new Promise(function (resolve) {
            var input = document.createElement("input");
            input.type = "file"; input.accept = accept;
            input.onchange = function () { resolve(input.files && input.files[0]); };
            input.oncancel = function () { resolve(null); };
            input.click();
        });
    }
    function toBase64(file) {
        return new Promise(function (resolve, reject) {
            var r = new FileReader();
            r.onload = function () { resolve(String(r.result).split(",")[1]); };
            r.onerror = reject; r.readAsDataURL(file);
        });
    }
    async function token() {
        if (csrf !== null) { return csrf; }
        try { var r = await fetch(API, { headers: { "X-CSRF-Token": "Fetch" }, credentials: "same-origin" }); csrf = r.headers.get("x-csrf-token") || ""; }
        catch (e) { csrf = ""; }
        return csrf;
    }
    async function post(path, body) {
        var headers = { "Content-Type": "application/json", Accept: "application/json" };
        var t = await token(); if (t) { headers["X-CSRF-Token"] = t; }
        var r = await fetch(API + path, { method: "POST", headers: headers, body: JSON.stringify(body), credentials: "same-origin" });
        var data = null; try { data = await r.json(); } catch (e) { /* no body */ }
        if (!r.ok) { throw new Error((data && data.error && data.error.message) || ("Request failed (" + r.status + ")")); }
        return data;
    }

    // 1) device -> Cloudinary (returns the link)   2) save the link on the record
    async function run(cfg, rec, file, docType, name) {
        if (ALLOWED.indexOf(file.type) < 0) { MessageBox.error("Only PDF, JPG and PNG files are allowed."); return; }
        if (file.size > MAX_BYTES) { MessageBox.error("The file is larger than 10 MB."); return; }
        BusyIndicator.show(0);
        try {
            var up = await post("uploadFile", { kind: cfg.kind, fileName: file.name, mediaType: file.type, content: await toBase64(file) });
            var url = up && (up.url || (up.value && up.value.url));
            if (!url) { throw new Error("Upload failed, please try again"); }
            var key = cfg.draft ? "(ID=" + rec.id + ",IsActiveEntity=true)" : "(ID=" + rec.id + ")";
            var body = cfg.mode === "photo" ? { url: url } : { docType: docType, fileName: name || file.name, url: url };
            await post(cfg.entity + key + "/AdminService." + cfg.action, body);
            MessageToast.show("Uploaded " + file.name);
            setTimeout(function () { location.reload(); }, 900);
        } catch (e) {
            console.error("[AAT upload] failed", e);
            MessageBox.error((e && e.message) || "Upload failed");
        } finally { BusyIndicator.hide(); }
    }

    function askDocument(cfg, rec) {
        var type = new Select({ width: "100%", items: cfg.docTypes.map(function (t) { return new Item({ key: t, text: t }); }) });
        var nameInput = new Input({ width: "100%", placeholder: "Optional, the file name is used if empty" });
        var dialog = new Dialog({
            title: "Upload document",
            content: [new VBox({ items: [new Label({ text: "Document type" }), type, new Label({ text: "Name" }), nameInput] }).addStyleClass("sapUiSmallMargin")],
            beginButton: new Button({
                text: "Choose file and upload", type: "Emphasized",
                press: function () {
                    var docType = type.getSelectedKey(), name = nameInput.getValue().trim();
                    var picked = pickFile(cfg.accept);               // opened straight from the click, so the browser allows it
                    dialog.close();
                    picked.then(function (file) { if (file) { run(cfg, rec, file, docType, name); } });
                }
            }),
            endButton: new Button({ text: "Cancel", press: function () { dialog.close(); } }),
            afterClose: function () { dialog.destroy(); }
        });
        dialog.open();
    }

    return {
        start: function (cfg) {
            try {
                var rec = currentRecord();
                console.info("[AAT upload] start", cfg.entity, rec);
                if (!rec) { MessageBox.error("Open a record first, then try again."); return; }
                if (!rec.active) { MessageBox.warning("Please save the record first, then upload a file."); return; }
                if (cfg.mode === "document") { askDocument(cfg, rec); return; }
                pickFile(cfg.accept).then(function (file) { if (file) { run(cfg, rec, file); } });
            } catch (e) { console.error(e); MessageBox.error("Could not start the upload: " + e.message); }
        }
    };
});