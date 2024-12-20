export const API_BASE_URL = import.meta.env.API_BASE_URL;

const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  USER: `${API_BASE_URL}/api/user`,
  UPDATE_USER: `${API_BASE_URL}/api/update`,
  CURRENT_TEACHERS: `${API_BASE_URL}/api/current-teachers`,
  TEACHERS: `${API_BASE_URL}/api/teachers`,
  TEACHER_BY_ID: (id: string) => `${API_BASE_URL}/api/teachers/${id}`,
  SUBJECTS: `${API_BASE_URL}/api/subjects`,
  SUBJECT_BY_ID: (id: string) => `${API_BASE_URL}/api/subjects/${id}`,
  RATINGS: `${API_BASE_URL}/api/ratings`,
  RATINGS_BY_TEACHER_SUBJECT_ID: (teacherSubjectId: number) => `${API_BASE_URL}/api/ratings/${teacherSubjectId}`,
  EVALUATE_TEACHER: `${API_BASE_URL}/api/evaluate-teacher`,
  SEARCH:(query: string) => `${API_BASE_URL}/api/search?query=${query}`,
};

export default ENDPOINTS;


