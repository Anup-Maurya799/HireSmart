import api from "./api";

export const applyToJob = (data) => api.post("/applications", data);
export const getMyApplications = () => api.get("/applications/mine");
export const getJobApplications = (jobId) =>
  api.get(`/applications/job/${jobId}`);

export const updateApplicationStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status });
