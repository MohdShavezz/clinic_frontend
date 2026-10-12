import { CLINIC_ROUTES } from "../api_routes/clinicRoutes";
import { CALL } from "../utils/CALL";

const request = async (method, url, data, token) => {
  const response = await CALL({ method, url, data, token });
  return response.data;
};

export const clinicApi = {
  dashboard: (token) => request("GET", CLINIC_ROUTES.DASHBOARD, null, token),
  patients: (token, search = "") => request("GET", `${CLINIC_ROUTES.PATIENTS}?search=${encodeURIComponent(search)}`, null, token),
  createPatient: (token, data) => request("POST", CLINIC_ROUTES.PATIENTS, data, token),
  updatePatient: (token, id, data) => request("PUT", CLINIC_ROUTES.PATIENT(id), data, token),
  archivePatient: (token, id) => request("DELETE", CLINIC_ROUTES.PATIENT(id), null, token),
  labs: (token) => request("GET", CLINIC_ROUTES.LABS, null, token),
  createLab: (token, data) => request("POST", CLINIC_ROUTES.LABS, data, token),
  updateLab: (token, id, data) => request("PUT", CLINIC_ROUTES.LAB(id), data, token),
  archiveLab: (token, id) => request("DELETE", CLINIC_ROUTES.LAB(id), null, token),
  parameters: (token) => request("GET", CLINIC_ROUTES.PARAMETERS, null, token),
  createParameter: (token, data) => request("POST", CLINIC_ROUTES.PARAMETERS, data, token),
  tests: (token) => request("GET", CLINIC_ROUTES.TESTS, null, token),
  createTest: (token, data) => request("POST", CLINIC_ROUTES.TESTS, data, token),
  consultations: (token, patientId = "") => request("GET", `${CLINIC_ROUTES.CONSULTATIONS}${patientId ? `?patientId=${patientId}` : ""}`, null, token),
  createConsultation: (token, data) => request("POST", CLINIC_ROUTES.CONSULTATIONS, data, token),
  reports: (token, patientId = "") => request("GET", `${CLINIC_ROUTES.REPORTS}${patientId ? `?patientId=${patientId}` : ""}`, null, token),
  createReport: (token, data) => request("POST", CLINIC_ROUTES.REPORTS, data, token),
};
