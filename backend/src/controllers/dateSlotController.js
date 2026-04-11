const DateSlot = require('../models/DateSlot');

// @desc Get all date slots
// @route GET /admin/date-slots
// @access Private (Admin)
const getDateSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const dateSlots = await DateSlot.find(query).sort({ date: 1 });
    res.json(dateSlots);
  } catch (error) {
    console.error('Get date slots error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Create or update date slots
// @route POST /admin/date-slots
// @access Private (Admin)
const createDateSlots = async (req, res) => {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ message: 'Date and timeSlots array are required' });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Check if date slot already exists
    let dateSlot = await DateSlot.findOne({ date: slotDate });

    if (dateSlot) {
      // Update existing slots
      dateSlot.timeSlots = timeSlots.map(ts => ({
        slot: ts.slot,
        maxTickets: ts.maxTickets || 10,
        bookedTickets: ts.bookedTickets || 0,
        isActive: ts.isActive !== false, // default to true
      }));
      dateSlot.isActive = true;
      await dateSlot.save();
    } else {
      // Create new date slot
      dateSlot = await DateSlot.create({
        date: slotDate,
        timeSlots: timeSlots.map(ts => ({
          slot: ts.slot,
          maxTickets: ts.maxTickets || 10,
          bookedTickets: 0,
          isActive: ts.isActive !== false,
        })),
        isActive: true,
      });
    }

    res.status(201).json(dateSlot);
  } catch (error) {
    console.error('Create date slots error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Update a specific date slot
// @route PUT /admin/date-slots/:id
// @access Private (Admin)
const updateDateSlot = async (req, res) => {
  try {
    const { timeSlots, isActive } = req.body;

    const dateSlot = await DateSlot.findById(req.params.id);
    if (!dateSlot) {
      return res.status(404).json({ message: 'Date slot not found' });
    }

    if (timeSlots) {
      dateSlot.timeSlots = timeSlots;
    }
    
    if (typeof isActive === 'boolean') {
      dateSlot.isActive = isActive;
    }

    await dateSlot.save();
    res.json(dateSlot);
  } catch (error) {
    console.error('Update date slot error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Delete a date slot
// @route DELETE /admin/date-slots/:id
// @access Private (Admin)
const deleteDateSlot = async (req, res) => {
  try {
    const dateSlot = await DateSlot.findById(req.params.id);
    if (!dateSlot) {
      return res.status(404).json({ message: 'Date slot not found' });
    }

    await dateSlot.deleteOne();
    res.json({ message: 'Date slot deleted successfully' });
  } catch (error) {
    console.error('Delete date slot error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Generate default date slots for upcoming days
// @route POST /admin/date-slots/generate
// @access Private (Admin)
const generateDefaultSlots = async (req, res) => {
  try {
    const { days = 30, timeSlots = ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], maxTickets = 10 } = req.body;

    const generatedSlots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip if slot already exists
      const existingSlot = await DateSlot.findOne({ date });
      if (existingSlot) {
        continue;
      }

      const slot = await DateSlot.create({
        date,
        timeSlots: timeSlots.map(ts => ({
          slot: ts,
          maxTickets,
          bookedTickets: 0,
          isActive: true,
        })),
        isActive: true,
      });

      generatedSlots.push(slot);
    }

    res.status(201).json({
      message: `Generated ${generatedSlots.length} date slots`,
      slots: generatedSlots,
    });
  } catch (error) {
    console.error('Generate default slots error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get daily ticket count
// @route GET /admin/date-slots/ticket-count
// @access Private (Admin)
const getTicketCount = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    const dateSlot = await DateSlot.findOne({ date: slotDate });
    
    if (!dateSlot) {
      return res.json({
        date: slotDate,
        totalTickets: 0,
        totalCapacity: 0,
        slots: [],
      });
    }

    const totalTickets = dateSlot.timeSlots.reduce((sum, slot) => sum + slot.bookedTickets, 0);
    const totalCapacity = dateSlot.timeSlots.reduce((sum, slot) => sum + slot.maxTickets, 0);

    res.json({
      date: slotDate,
      totalTickets,
      totalCapacity,
      available: totalCapacity - totalTickets,
      slots: dateSlot.timeSlots.map(slot => ({
        time: slot.slot,
        booked: slot.bookedTickets,
        max: slot.maxTickets,
        available: slot.maxTickets - slot.bookedTickets,
      })),
    });
  } catch (error) {
    console.error('Get ticket count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDateSlots,
  createDateSlots,
  updateDateSlot,
  deleteDateSlot,
  generateDefaultSlots,
  getTicketCount,
};
