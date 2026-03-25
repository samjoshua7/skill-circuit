const Service = require('../models/Service');

// @desc    Create a new service (Vendor only)
// @route   POST /api/services/create
const createService = async (req, res) => {
  const { title, description, category, basePrice, serviceflow, location, tags } = req.body;

  // --- Validation ---
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters.' });
  }
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters.' });
  }
  if (!category || category.trim() === '') {
    return res.status(400).json({ error: 'Category is required.' });
  }
  if (!basePrice || Number(basePrice) <= 0) {
    return res.status(400).json({ error: 'Base Price must be greater than 0.' });
  }
  if (!serviceflow || !Array.isArray(serviceflow) || serviceflow.length < 3) {
    return res.status(400).json({ error: 'Service flow must have at least 3 steps.' });
  }
  if (!location || location.trim() === '') {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    const service = new Service({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      basePrice: Number(basePrice),
      serviceflow,
      location: location.trim(),
      tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean) : [],
      createdBy: req.user._id,
    });

    await service.save();
    res.status(201).json({ message: 'Service created successfully!', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all active services
// @route   GET /api/services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate('createdBy', 'name reputationScore');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createService, getAllServices };
