const express = require("express");
const router = express.Router();
const { getSolutions, createSolution } = require("../controllers/solutionController");
const protect = require("../middlewares/authMiddleware"); // Import your auth middleware if required

router.route("/")
  .get(getSolutions)
  .post(protect, createSolution);

module.exports = router;