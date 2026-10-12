const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const CLINIC = `${API_BASE}/clinic`;

export const CLINIC_ROUTES = {
  DASHBOARD: `${CLINIC}/dashboard`,
  PATIENTS: `${CLINIC}/patients`,
  PATIENT: (id) => `${CLINIC}/patients/${id}`,
  LABS: `${CLINIC}/labs`,
  LAB: (id) => `${CLINIC}/labs/${id}`,
  PARAMETERS: `${CLINIC}/parameters`,
  TESTS: `${CLINIC}/tests`,
  CONSULTATIONS: `${CLINIC}/consultations`,
  REPORTS: `${CLINIC}/reports`,
};
