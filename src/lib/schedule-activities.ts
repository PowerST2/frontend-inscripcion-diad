import { apiRequest } from "./api";

const REGISTRATION_ACTIVITY_NAMES = [
  "Inscripcion",
  "Inscripción",
  "Inscripciones",
  "Inscripciones activas",
  "Inscripciones dentro de plazo",
];

const SEMI_SCHOLARSHIP_ACTIVITY_NAMES = ["Semibeca", "Semibecas"];

type ScheduleActivityResponse = {
  status: "success";
  is_active: boolean;
};

export function isRegistrationActivityOpen() {
  return isAnyScheduleActivityActive(REGISTRATION_ACTIVITY_NAMES);
}

export function isSemiScholarshipActivityOpen() {
  return isAnyScheduleActivityActive(SEMI_SCHOLARSHIP_ACTIVITY_NAMES);
}

async function isAnyScheduleActivityActive(names: string[]) {
  try {
    const response = await apiRequest<ScheduleActivityResponse>("/schedule-activities", {
      method: "POST",
      body: JSON.stringify({ names }),
      cache: "no-store",
    });

    return response.is_active;
  } catch {
    return false;
  }
}
