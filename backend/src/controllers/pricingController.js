const PricingConfig = require('../models/PricingConfig');
const AuditLog = require('../models/AuditLog');

// @desc    Get all pricing configurations
// @route   GET /pricing
// @access  Public
const getPricing = async (req, res) => {
  try {
    const pricingConfigs = await PricingConfig.find().sort({ category: 1 });
    res.json(pricingConfigs);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update pricing configuration
// @route   PUT /pricing
// @access  Private (Admin)
const updatePricing = async (req, res) => {
  try {
    const { category, ratePerKg, conditionFactors } = req.body;

    let pricingConfig = await PricingConfig.findOne({ category });

    if (!pricingConfig) {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }

    if (ratePerKg) pricingConfig.ratePerKg = ratePerKg;
    
    if (conditionFactors) {
      if (conditionFactors.WORKING) pricingConfig.conditionFactors.WORKING = conditionFactors.WORKING;
      if (conditionFactors.PARTIAL) pricingConfig.conditionFactors.PARTIAL = conditionFactors.PARTIAL;
      if (conditionFactors.SCRAP) pricingConfig.conditionFactors.SCRAP = conditionFactors.SCRAP;
    }

    pricingConfig.updatedAt = Date.now();
    await pricingConfig.save();

    // Log action
    await AuditLog.create({
      action: 'pricing_updated',
      actorId: req.user.id,
      actorRole: req.user.role,
      meta: { category, ratePerKg, conditionFactors },
    });

    res.json(pricingConfig);
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPricing,
  updatePricing,
};
