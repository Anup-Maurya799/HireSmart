import express from 'express';
import { body } from 'express-validator';
import {
  registerRecruiter,
  loginRecruiter,
  registerApplicant,
  loginApplicant,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post(
  '/recruiter/register',
  [...registerRules, body('companyName').trim().notEmpty().withMessage('Company name is required')],
  validate,
  registerRecruiter
);
router.post('/recruiter/login', loginRules, validate, loginRecruiter);

router.post('/applicant/register', registerRules, validate, registerApplicant);
router.post('/applicant/login', loginRules, validate, loginApplicant);

router.get('/me', protect, getMe);

export default router;