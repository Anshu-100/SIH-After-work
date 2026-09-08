const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Infrastructure',
      'Healthcare',
      'Education',
      'Environment',
      'Smart City',
      'Agriculture',
      'Governance',
      'Other'
    ],
    default: 'Other',
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['in-progress', 'pending', 'completed'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ==========================================
  // AI PROBLEM ANALYSIS (from problem_analyzer.py service)
  // Optional — populated only when the "AI Categorize" step runs
  // ==========================================
  aiAnalysis: {
    language: { type: String },
    languageCode: { type: String },
    detectedCategory: { type: String },
    categoryConfidence: { type: Number },
    matchedCategoryKeywords: [{ type: String }],
    problemType: { type: String },
    problemTypeConfidence: { type: Number },
    severity: { type: String },
    severityConfidence: { type: Number },
    affectedGroup: { type: String },
    affectedGroupConfidence: { type: Number },
    impactLevel: { type: String },
    requiredSkills: [{ type: String }],
    summary: { type: String },
    overallConfidence: { type: Number },
    translatedText: { type: String },
  },
}, { timestamps: true })

module.exports = mongoose.model("Task", taskSchema)
