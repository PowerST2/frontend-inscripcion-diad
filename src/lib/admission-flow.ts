import type { ApplicantProgress } from "./applicant";

export type FlowStep = {
  key: string;
  label: string;
  href: string;
};

export const FLOW_STEPS: FlowStep[] = [
  { key: "initial_consent_complete", label: "Aceptar declaración inicial", href: "/pre-inscription-affidavit" },
  { key: "personal_data_complete", label: "Completar datos personales", href: "/personal-data" },
  { key: "modality_complete", label: "Elegir modalidad, carrera y colegio", href: "/modality" },
  { key: "documents_complete", label: "Subir documentos de modalidad", href: "/documents" },
  { key: "family_complete", label: "Completar datos familiares", href: "/family-data" },
  { key: "quiz_complete", label: "Responder encuesta del postulante", href: "/quiz" },
  { key: "sworn_declaration_complete", label: "Subir declaración jurada", href: "/sworn-affidavit" },
  { key: "payments_complete", label: "Completar pago", href: "/payment" },
  { key: "data_confirmed", label: "Confirmar datos", href: "/resume" },
  { key: "satisfaction_survey_complete", label: "Responder encuesta final", href: "/satisfaction" },
];

export const ALWAYS_ALLOWED_PATHS = new Set([
  "/my-profile",
  "/login-registro",
  "/",
]);

export function getNextFlowStep(progress: ApplicantProgress | null): FlowStep {
  const state = progress?.progress ?? {};

  return FLOW_STEPS.find((step) => !state[step.key]) ?? FLOW_STEPS[FLOW_STEPS.length - 1];
}

export function getStepForPath(pathname: string) {
  return FLOW_STEPS.find((step) => pathname === step.href);
}

export function canAccessFlowPath(pathname: string, progress: ApplicantProgress | null) {
  if (ALWAYS_ALLOWED_PATHS.has(pathname)) {
    return true;
  }

  const requestedStep = getStepForPath(pathname);
  if (!requestedStep) {
    return true;
  }

  const nextStep = getNextFlowStep(progress);
  const requestedIndex = FLOW_STEPS.findIndex((step) => step.href === requestedStep.href);
  const nextIndex = FLOW_STEPS.findIndex((step) => step.href === nextStep.href);

  return requestedIndex <= nextIndex;
}
