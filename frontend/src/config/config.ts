export const API_BASE_URL = import.meta.env.API_BASE_URL;

const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,
  USER: `${API_BASE_URL}/user`,
  UPDATE_USER: `${API_BASE_URL}/update`,
  CURRENT_TEACHERS: `${API_BASE_URL}/current-teachers`,
  TEACHERS: `${API_BASE_URL}/teachers`,
  TEACHER_BY_ID: (id: string) => `${API_BASE_URL}/teachers/${id}`,
  SUBJECTS: `${API_BASE_URL}/subjects`,
  SUBJECT_BY_ID: (id: string) => `${API_BASE_URL}/subjects/${id}`,
  RATINGS: `${API_BASE_URL}/ratings`,
  RATINGS_BY_TEACHER_SUBJECT_ID: (teacherSubjectId: number) => `${API_BASE_URL}/ratings/${teacherSubjectId}`,
  EVALUATE_TEACHER: `${API_BASE_URL}/evaluate-teacher`,
  SEARCH:(query: string) => `${API_BASE_URL}/search?query=${query}`,
};

export default ENDPOINTS;


