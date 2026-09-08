const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
  {
    // Reference to the problem/task being solved
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
    },
    // Reference to the user who submitted the solution
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    title: {
      type: String,
      required: [true, "Solution title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Solution description is required"],
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    demoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "under-review", "accepted", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solution", solutionSchema);