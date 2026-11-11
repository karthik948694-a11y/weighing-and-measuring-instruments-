const jwt = require('jsonwebtoken');
const { users } = require('../services/dbStore');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Login required' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'lmvs-dev-secret-change-in-production-2026');
    const user = await users.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Account not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed for this role' });
    }
    next();
  };
}

module.exports = { auth, requireRole };
