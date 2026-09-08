const Collaboration = require('../models/Collaboration');
const task = require('../models/Task');
const mongoose=require('mongoose')

// POST /api/collaborations
exports.submitCollaboration = async (req, res) => {
  try {
    const { instituteName, problemId, expectedCost, durationToSolve } = req.body;

    // 1. Validate required fields
    if (!instituteName || !problemId || !expectedCost || !durationToSolve) {
      return res.status(400).json({ 
        message: 'Please provide instituteName, problemId, expectedCost, and durationToSolve.' 
      });
    }
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ 
        message: 'Invalid Problem ID format. Must be a valid 24-character MongoDB ID.' 
      });
    }

    // 2. Check if the target problem exists
    const existingProblem = await task.findById(problemId);
    if (!existingProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // 3. Create Collaboration Record
    const newCollaboration = await Collaboration.create({
      instituteName,
      problemId,
      expectedCost: Number(expectedCost),
      durationToSolve,
      submittedBy: req.user.id // Taken from your Auth Middleware (JWT payload)
    });

    res.status(201).json({
      message: 'Collaboration request submitted successfully',
      collaboration: newCollaboration,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error while submitting collaboration request',
      error: error.message 
    });
  }
};

// GET /api/collaborations (Get user's submitted collaborations)
exports.getUserCollaborations = async (req, res) => {
  try {
    const requests = await Collaboration.find({ submittedBy: req.user.id })
      .populate('problemId', 'title category location')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};