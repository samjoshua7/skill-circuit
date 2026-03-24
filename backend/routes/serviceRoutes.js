const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// @route   POST /api/services
// @desc    Create a new service (Vendor)
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/services
// @desc    Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate('createdBy', 'name reputationScore');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
