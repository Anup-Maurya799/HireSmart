import jwt from 'jsonwebtoken';
import Recruiter from '../models/Recruiter.js';
import Applicant from '../models/Applicant.js';

// Verifies the JWT and attaches the logged-in user to req.user
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const Model = decoded.role === 'recruiter' ? Recruiter : Applicant;
      const user = await Model.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      req.user = user;
      req.role = decoded.role;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

// Restricts a route to specific roles, e.g. authorize('recruiter')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: `Role '${req.role}' is not allowed here` });
    }
    next();
  };
};