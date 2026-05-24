const AuditLog = require('../models/AuditLog');

const logAudit = async ({ action, userId, targetId = '', details = '', type = 'info', status = 'completed' }) => {
  try {
    await AuditLog.create({ action, userId, targetId, details, type, status });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = { logAudit };
