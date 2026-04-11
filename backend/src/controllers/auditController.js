const AuditLog = require('../models/AuditLog');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');

// @desc    Log an audit event
// @route   POST /audit
// @access  Private
const logAudit = async (req, res) => {
  try {
    const { action, requestId, meta } = req.body;

    const auditLog = await AuditLog.create({
      action,
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId,
      meta,
    });

    res.status(201).json(auditLog);
  } catch (error) {
    console.error('Log audit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get audit logs for a request
// @route   GET /audit/request/:requestId
// @access  Private
const getAuditLogsByRequest = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find({ requestId: req.params.requestId })
      .populate('actorId', 'name role')
      .sort({ timestamp: 1 });

    res.json(auditLogs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get admin statistics
// @route   GET /admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const completedRequests = await Request.countDocuments({ status: 'COMPLETED' });
    const pendingRequests = await Request.countDocuments({ 
      status: { $in: ['CREATED', 'SCHEDULED', 'IN_PROGRESS'] } 
    });

    const transactions = await Transaction.find({ paymentStatus: 'PAID' });
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totalRequests,
      completedRequests,
      pendingRequests,
      totalAmount,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reports
// @route   GET /admin/reports
// @access  Private (Admin)
const getReports = async (req, res) => {
  try {
    const { period } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const requests = await Request.find({
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const transactions = await Transaction.find({
      createdAt: { $gte: startDate },
      paymentStatus: 'PAID',
    }).sort({ createdAt: 1 });

    // Group by date
    const reportMap = {};
    
    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      if (!reportMap[date]) {
        reportMap[date] = { date, count: 0, amount: 0 };
      }
      reportMap[date].count += 1;
    });

    transactions.forEach(trans => {
      const date = trans.createdAt.toISOString().split('T')[0];
      if (!reportMap[date]) {
        reportMap[date] = { date, count: 0, amount: 0 };
      }
      reportMap[date].amount += trans.amount;
    });

    const reports = Object.values(reportMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  logAudit,
  getAuditLogsByRequest,
  getAdminStats,
  getReports,
};
