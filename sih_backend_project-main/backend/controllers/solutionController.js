const Solution = require("../models/Solution");

// GET /api/solutions - Fetch all solutions
const getSolutions = async (req, res) => {
  try {
    const solutions = await Solution.find()
      .populate("user", "name email")
      .populate("task", "title category location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: solutions.length,
      data: solutions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/solutions - Create a new solution submission
const createSolution = async (req, res) => {
  try {
    const { taskId, title, description, githubUrl, demoUrl } = req.body;

    const solution = await Solution.create({
      task: taskId,
      user: req.user._id, // Assumes auth middleware populates req.user
      title,
      description,
      githubUrl,
      demoUrl,
    });

    res.status(201).json({
      success: true,
      data: solution,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSolutions, createSolution };