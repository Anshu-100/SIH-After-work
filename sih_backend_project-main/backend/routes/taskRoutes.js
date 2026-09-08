const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// Allows the frontend dropdown to fetch all tasks/problems
// ==========================================

// GET /api/tasks -> Retrieve all tasks for public display/dropdown
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id -> Retrieve a single task publicly (no auth required)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task Not Found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PROTECTED ROUTES (Requires Authentication)
// ==========================================

// Apply auth middleware to all routes defined BELOW this line
router.use(authMiddleware);

// 1. Create or add new task
router.post('/', async (req, res) => {
  try {
    const { title, category, description, location, aiAnalysis } = req.body;

    if (!title || !category || !description || !location) {
      return res
        .status(400)
        .json({ message: "Title, category, description, and location are required." });
    }

    const task = new Task({
      title,
      category,
      description,
      location,
      user: req.user.id,
      // aiAnalysis is optional — only saved if the frontend ran the
      // "AI Categorize" step and sent the analyzer's result along
      ...(aiAnalysis && { aiAnalysis }),
    });

    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get single task by ID — authenticated version (can be used later for edit/delete flows)
router.get('/my/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task Not Found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    await task.save();
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
