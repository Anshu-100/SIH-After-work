const express = require('express');
const mongoose =require('mongoose');
const router = express.Router();
const { submitCollaboration, getUserCollaborations } = require('../controllers/collaborationController');
const authMiddleware = require('../middlewares/authMiddleware'); // Ensures req.user is set

// Routes protected by JWT authentication
router.post('/', authMiddleware, submitCollaboration);
router.get('/my-requests', authMiddleware, getUserCollaborations);

module.exports = router;