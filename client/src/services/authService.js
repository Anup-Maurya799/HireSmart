import api from "./api";

export const registerRecruiter = (data) =>
  api.post("/auth/recruiter/register", data);
export const loginRecruiter = (data) => api.post("/auth/recruiter/login", data);
export const registerApplicant = (data) =>
  api.post("/auth/applicant/register", data);
export const loginApplicant = (data) => api.post("/auth/applicant/login", data);
export const getMe = () => api.get("/auth/me");
