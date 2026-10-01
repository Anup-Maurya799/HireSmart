import jwt from "jsonwebtoken";

// id = user's Mongo _id, role = 'recruiter' or 'applicant'
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
