const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * govMiddleware — verifies JWT token AND checks user.role === 'government'
 * Returns 403 if the logged-in user is not a government account.
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Government login required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.role !== 'government') {
      return res.status(403).json({ message: 'Access denied. Government accounts only.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

