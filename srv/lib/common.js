const cds = require('@sap/cds');

async function nextNumber(entityName, field, prefix, pad = 4) {
  const { [entityName]: E } = cds.entities('aat');
  const rows = await SELECT.from(E).columns(field);
  const max = rows.reduce((m, r) => Math.max(m, parseInt((r[field] || '').split('-').pop()) || 0), 0);
  return `${prefix}-${String(max + 1).padStart(pad, '0')}`;
}

async function audit(entity, key, action, user, details) {
  const { AuditLog } = cds.entities('aat');
  await INSERT.into(AuditLog).entries({
    entity, entityKey: key, action, userId: user?.id,
    timestamp: new Date().toISOString(), details: JSON.stringify(details || {})
  });
}

async function addHistory(applicationID, from, to, user, remarks) {
  const { ApplicationHistory } = cds.entities('aat');
  await INSERT.into(ApplicationHistory).entries({
    application_ID: applicationID, fromStatus: from, toStatus: to,
    changedBy: user?.id, changedAt: new Date().toISOString(), remarks
  });
}
module.exports = { nextNumber, audit, addHistory };