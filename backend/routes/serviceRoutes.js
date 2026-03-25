const express = require('express');
const router = express.Router();
const { requireVendor } = require('../middleware/auth');
const { createService, getAllServices } = require('../controllers/serviceController');
const Service = require('../models/Service');

// @route   POST /api/services/create
// @desc    Create a new service (Vendor only)
router.post('/create', requireVendor, createService);

// @route   GET /api/services/vendor/:vendorId
// @desc    Get all services by a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.params.vendorId })
      .sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/services
// @desc    Get all active services (public)
router.get('/', getAllServices);

// @route   PUT /api/services/:id
// @desc    Update a service (Vendor only — must own the service)
router.put('/:id', requireVendor, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    if (service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not own this service.' });
    }
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service (Vendor only — must own the service)
router.delete('/:id', requireVendor, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    if (service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not own this service.' });
    }
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
