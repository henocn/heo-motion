import apiClient from "./client";

// Recupere la liste paginee des projets
export async function fetchProjects(page = 1, pageSize = 20) {
  const { data } = await apiClient.get("/projects", {
    params: { page, page_size: pageSize },
  });
  return data;
}

// Recupere un projet par son id
export async function fetchProject(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data;
}

// Cree un nouveau projet
export async function createProject(payload) {
  const { data } = await apiClient.post("/projects", payload);
  return data;
}

// Met a jour un projet existant
export async function updateProject(projectId, payload) {
  const { data } = await apiClient.put(`/projects/${projectId}`, payload);
  return data;
}

// Supprime un projet
export async function deleteProject(projectId) {
  const { data } = await apiClient.delete(`/projects/${projectId}`);
  return data;
}
