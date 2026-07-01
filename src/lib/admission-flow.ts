import type { ApplicantProgress } from "./applicant";

export type FlowStep = {
  key: string;
  label: string;
  href: string;
};

export const FLOW_STEPS: FlowStep[] = [
  { key: "initial_consent_complete", label: "Aceptar declaración inicial", href: "/pre-inscription-affidavit" },
  { key: "identity_complete", label: "Completar datos personales", href: "/personal-data" },
  { key: "identity_document_complete", label: "Subir documento de identidad", href: "/identity-document" },
  { key: "sworn_declaration_submitted", label: "Subir declaración jurada", href: "/sworn-affidavit" },
  { key: "photo_complete", label: "Subir foto del postulante", href: "/photo" },
  { key: "modality_complete", label: "Elegir modalidad, carrera y colegio", href: "/modality" },
  { key: "documents_complete", label: "Subir documentos de modalidad", href: "/documents" },
  { key: "family_complete", label: "Completar datos familiares", href: "/family-data" },
  { key: "quiz_complete", label: "Responder encuesta del postulante", href: "/quiz" },
  { key: "payments_complete", label: "Completar pago", href: "/payment" },
  { key: "data_confirmed", label: "Confirmar datos", href: "/resume" },
  { key: "satisfaction_survey_complete", label: "Responder encuesta final", href: "/satisfaction" },
  { key: "satisfaction_survey_complete", label: "Inscripción culminada", href: "/registration-complete" },
];

const STRICT_FLOW_STEPS = FLOW_STEPS.slice(0, 2);

const CONFIRMATION_PREREQUISITE_STEPS: FlowStep[] = [
  { key: "initial_consent_complete", label: "Aceptar declaración inicial", href: "/pre-inscription-affidavit" },
  { key: "identity_complete", label: "Completar datos personales", href: "/personal-data" },
  { key: "identity_document_complete", label: "Subir documento de identidad", href: "/identity-document" },
  { key: "sworn_declaration_complete", label: "Declaración jurada aprobada", href: "/sworn-affidavit" },
  { key: "photo_complete", label: "Subir foto del postulante", href: "/photo" },
  { key: "modality_complete", label: "Elegir modalidad, carrera y colegio", href: "/modality" },
  { key: "documents_complete", label: "Subir documentos de modalidad", href: "/documents" },
  { key: "family_complete", label: "Completar datos familiares", href: "/family-data" },
  { key: "quiz_complete", label: "Responder encuesta del postulante", href: "/quiz" },
  { key: "payments_complete", label: "Completar pago", href: "/payment" },
];

export const ALWAYS_ALLOWED_PATHS = new Set([
  "/my-profile",
  "/login-registro",
  "/",
]);

export function getNextFlowStep(progress: ApplicantProgress | null): FlowStep {
  const state = progress?.progress ?? {};

  return STRICT_FLOW_STEPS.find((step) => !state[step.key])
    ?? CONFIRMATION_PREREQUISITE_STEPS.find((step) => !state[step.key])
    ?? FLOW_STEPS.find((step) => !state[step.key])
    ?? FLOW_STEPS[FLOW_STEPS.length - 1];
}

export function getStepForPath(pathname: string) {
  return FLOW_STEPS.find((step) => pathname === step.href);
}

export function canAccessFlowPath(pathname: string, progress: ApplicantProgress | null) {
  const state = progress?.progress ?? {};

  if (pathname === "/my-profile") {
    return Boolean(state.initial_consent_complete) && Boolean(state.identity_complete);
  }

  if (ALWAYS_ALLOWED_PATHS.has(pathname)) {
    return true;
  }

  const requestedStep = getStepForPath(pathname);
  if (!requestedStep) {
    return true;
  }

  const strictFlowComplete = STRICT_FLOW_STEPS.every((step) => state[step.key]);

  if (pathname === "/resume") {
    return areConfirmationPrerequisitesComplete(progress);
  }

  if (pathname === "/satisfaction") {
    return Boolean(state.data_confirmed) && areConfirmationPrerequisitesComplete(progress);
  }

  if (pathname === "/registration-complete") {
    return Boolean(state.data_confirmed) &&
      Boolean(state.satisfaction_survey_complete) &&
      areConfirmationPrerequisitesComplete(progress);
  }

  if (strictFlowComplete) {
    return true;
  }

  const nextStep = STRICT_FLOW_STEPS.find((step) => !state[step.key]) ?? STRICT_FLOW_STEPS[STRICT_FLOW_STEPS.length - 1];
  const requestedIndex = STRICT_FLOW_STEPS.findIndex((step) => step.href === requestedStep.href);
  const nextIndex = STRICT_FLOW_STEPS.findIndex((step) => step.href === nextStep.href);

  if (requestedIndex === -1) {
    return false;
  }

  return requestedIndex <= nextIndex;
}

export function areConfirmationPrerequisitesComplete(progress: ApplicantProgress | null) {
  const state = progress?.progress ?? {};

  return CONFIRMATION_PREREQUISITE_STEPS.every((step) => state[step.key]);
}
