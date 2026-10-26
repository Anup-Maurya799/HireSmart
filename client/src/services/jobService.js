import api from "./api";

export const getPublicJobs = (params) => api.get("/jobs", { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getMyJobs = () => api.get("/jobs/mine/list");
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const archiveJob = (id) => api.patch(`/jobs/${id}/archive`);
