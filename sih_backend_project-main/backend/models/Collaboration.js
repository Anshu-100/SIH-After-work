const mongoose = require('mongoose');

// backend/models/Collaboration.js
const collaborationSchema = new mongoose.Schema({
  instituteName: { type: String, required: true },
  problemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  }, // Ensures it expects a 24-character hex ObjectId
  expectedCost: { type: Number, required: true },
  durationToSolve: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
  { timestamps: true }
);

module.exports = mongoose.model('Collaboration', collaborationSchema);