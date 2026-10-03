import Recruiter from "../models/Recruiter.js";
import Applicant from "../models/Applicant.js";
import generateToken from "../utils/generateToken.js";

const buildAuthResponse = (user, role) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role,
  token: generateToken(user._id, role),
});

// @route POST /api/auth/recruiter/register
export const registerRecruiter = async (req, res, next) => {
  try {
    const { name, email, password, companyName, companyWebsite } = req.body;

    const exists = await Recruiter.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const recruiter = await Recruiter.create({
      name,
      email,
      password,
      companyName,
      companyWebsite,
    });

    res.status(201).json(buildAuthResponse(recruiter, "recruiter"));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/recruiter/login
export const loginRecruiter = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const recruiter = await Recruiter.findOne({ email }).select("+password");

    if (!recruiter || !(await recruiter.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(buildAuthResponse(recruiter, "recruiter"));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/applicant/register
export const registerApplicant = async (req, res, next) => {
  try {
    const { name, email, password, skills, experienceYears, phone, headline } =
      req.body;

    const exists = await Applicant.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const applicant = await Applicant.create({
      name,
      email,
      password,
      skills,
      experienceYears,
      phone,
      headline,
    });

    res.status(201).json(buildAuthResponse(applicant, "applicant"));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/applicant/login
export const loginApplicant = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const applicant = await Applicant.findOne({ email }).select("+password");

    if (!applicant || !(await applicant.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(buildAuthResponse(applicant, "applicant"));
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me  (works for either role, uses protect middleware)
export const getMe = async (req, res) => {
  res.json({ ...req.user.toObject(), role: req.role });
};
