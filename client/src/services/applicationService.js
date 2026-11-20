import api from "./api";

export const applyToJob = (data) => api.post("/applications", data);
export const getMyApplications = () => api.get("/applications/mine");
export const getJobApplications = (jobId) =>
  api.get(`/applications/job/${jobId}`);
