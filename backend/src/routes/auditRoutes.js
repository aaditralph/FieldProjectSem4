const express = require('express');
const router = express.Router();
const {
  logAudit,
  getAuditLogsByRequest,
  getAdminStats,
  getReports,
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, logAudit);
router.get('/request/:requestId', protect, getAuditLogsByRequest);
router.get('/admin/stats', protect, authorize('ADMIN'), getAdminStats);
router.get('/admin/reports', protect, authorize('ADMIN'), getReports);

module.exports = router;
