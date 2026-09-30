import "dotenv/config";
import mongoose from "mongoose";
import Recruiter from "../models/Recruiter.js";
import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");

  const recruiter = await Recruiter.create({
    name: "Test Recruiter",
    email: `recruiter${Date.now()}@test.com`,
    password: "secret123",
    companyName: "Test Corp",
  });

  const applicant = await Applicant.create({
    name: "Test Applicant",
    email: `applicant${Date.now()}@test.com`,
    password: "secret123",
    skills: ["React", "Node.js"],
    experienceYears: 1,
  });

  const job = await Job.create({
    recruiter: recruiter._id,
    title: "MERN Intern",
    description: "Build web apps with the MERN stack.",
    location: "Ahmedabad",
    jobType: "Internship",
    skillsRequired: ["React", "Node.js", "MongoDB"],
  });

  const application = await Application.create({
    job: job._id,
    applicant: applicant._id,
    resumeKey: "resumes/test.pdf",
  });

  console.log("Application created with status:", application.status);
  console.log("History:", application.statusHistory);

  // Clean up test data
  await Promise.all([
    Application.deleteMany({ _id: application._id }),
    Job.deleteMany({ _id: job._id }),
    Applicant.deleteMany({ _id: applicant._id }),
    Recruiter.deleteMany({ _id: recruiter._id }),
  ]);
  console.log("Test data removed. All models work!");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
