const express = require('express');
const Task = require('../models/Task');
const govMiddleware = require('../middlewares/govMiddleware');

const router = express.Router();

// All routes below require government auth
router.use(govMiddleware);

// ─────────────────────────────────────────────────────────
// GET /api/gov/problems
// Returns all problems with optional filters: status, severity, category
// ─────────────────────────────────────────────────────────
router.get('/problems', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.severity) filter.severity  = req.query.severity;
    if (req.query.category) filter.category  = req.query.category;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'email');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/gov/stats
// Returns summary counts per status + per category
// ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total    = await Task.countDocuments();
    const pending  = await Task.countDocuments({ status: 'pending' });
    const review   = await Task.countDocuments({ status: 'under-review' });
    const progress = await Task.countDocuments({ status: 'in-progress' });
    const resolved = await Task.countDocuments({ status: 'resolved' });

    // Count by severity
    const critical = await Task.countDocuments({ severity: { $in: ['CRITICAL', 'Critical'] } });
    const high     = await Task.countDocuments({ severity: { $in: ['HIGH', 'High'] } });
    const medium   = await Task.countDocuments({ severity: { $in: ['MEDIUM', 'Medium'] } });
    const low      = await Task.countDocuments({ severity: { $in: ['LOW', 'Low'] } });

    res.json({
      total,
      byStatus: { pending, 'under-review': review, 'in-progress': progress, resolved },
      bySeverity: { critical, high, medium, low },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/gov/problems/:id/status
// Update the status of a problem
// Body: { status: 'under-review' | 'in-progress' | 'resolved' | 'pending' }
// ─────────────────────────────────────────────────────────
router.put('/problems/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'under-review', 'in-progress', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Problem not found' });

    res.json({ message: 'Status updated successfully', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/gov/problems/:id/response
// Add or update the official government response on a problem
// Body: { responseText, department, resolvedBy, resolutionId }
// ─────────────────────────────────────────────────────────
router.put('/problems/:id/response', async (req, res) => {
  try {
    const { responseText, department, resolvedBy, resolutionId } = req.body;

    if (!responseText) {
      return res.status(400).json({ message: 'responseText is required.' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        govResponse: {
          responseText,
          department:   department   || '',
          resolvedBy:   resolvedBy   || '',
          resolutionId: resolutionId || '',
          respondedAt:  new Date(),
        },
        // Automatically mark as resolved when response is posted
        status: 'resolved',
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Problem not found' });

    res.json({ message: 'Government response saved', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

