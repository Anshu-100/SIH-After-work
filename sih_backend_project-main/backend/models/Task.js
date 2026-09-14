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
      'Urban Infrastructure',
      'Infrastructure',
      'Water Management',
      'Sanitation',
      'Healthcare',
      'Education',
      'Agriculture',
      'Environment',
      'Transportation',
      'Public Safety',
      'Energy',
      'Smart City',
      'Governance',
      'Other'
    ],
    default: 'Other',
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'Critical', 'High', 'Medium', 'Low'],
    default: 'MEDIUM'
  },
  impactScore: {
    type: String,
    default: 'Medium'
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
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'in-progress', 'resolved'],
    default: 'pending'
  },
  govResponse: {
    responseText: { type: String },
    department:   { type: String },
    resolvedBy:   { type: String },
    resolutionId: { type: String },
    respondedAt:  { type: Date },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ==========================================
  // AI PROBLEM ANALYSIS (from problem_analyzer.py service)
  // Populated when AI Categorization runs
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
    modelPipeline: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
