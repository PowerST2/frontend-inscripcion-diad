import { API_BASE_URL, ApiError, apiRequest } from "./api";

export type CatalogOption = {
  id: number;
  name: string;
  code?: string;
};

export type UbigeoDepartment = {
  code: string;
  name: string;
};

export type UbigeoProvince = {
  code: string;
  name: string;
};

export type UbigeoDistrict = {
  id: number;
  name: string;
};

export type SchoolOption = {
  id: number;
  name: string;
  modular_code?: string | null;
  level?: string | null;
  ubigeo_id?: number | null;
};

export type UbigeoDetail = {
  id: number;
  code: string;
  department: string;
  province: string;
  district: string;
};

export type ApplicantPersonalDataPayload = {
  documentType: "DNI" | "CE" | "PASSPORT";
  documentNumber: string;
  fatherLastName: string;
  motherLastName: string;
  names: string;
  email: string;
  genderId: number;
  applicantPhone: string;
  guardianPhone: string | null;
  otherPhone: string;
  countryResidenceId: number;
  ubigeoResidenceId: number | null;
  birthDate: string;
  address: string;
  secondaryStartYear: number;
  secondaryEndYear: number;
  countryBirthId: number;
  ubigeoBirthId: number | null;
  hasDisability: boolean;
  disabilityDescription: string | null;
};

export type ApplicantProgress = {
  status: "success";
  progress: Record<string, boolean>;
  applicant: null | {
    code?: string | null;
    document_number?: string | null;
    document_type?: { id: number; code: string; name: string } | null;
    paternal_surname?: string | null;
    maternal_surname?: string | null;
    names?: string | null;
    email?: string | null;
    gender_id?: number | null;
    cellular_phone?: string | null;
    phone?: string | null;
    other_phone?: string | null;
    country_residence_id?: number | null;
    ubigeo_residence_id?: number | null;
    date_birth?: string | null;
    direction?: string | null;
    start_study?: number | null;
    end_study?: number | null;
    country_birth_id?: number | null;
    ubigeo_birth_id?: number | null;
    has_disability?: boolean | null;
    disability_description?: string | null;
    modality1_id?: number | null;
    faculties_id?: number | null;
    speciality1_id?: number | null;
    family_members?: FamilyMember[];
    documents?: ApplicantUploadedDocument[];
    quiz?: {
      main_reason?: string | null;
      specialty_preference?: string | null;
      preparation_type?: string | null;
      preparation_months?: number | null;
      family_income?: string | number | null;
      source?: string | null;
      source_name?: string | null;
      source_social_network?: string | null;
      parents_teacher_career?: string | null;
      sisfoh?: string | null;
    } | null;
    data_confirmed?: boolean | null;
    has_vacancy_right?: boolean | null;
    photo_url?: string | null;
    photo_path?: string | null;
    photo_status?: "pending" | "approved" | "rejected" | string | null;
    identity_document_name?: string | null;
    documents_review?: {
      pending_count: number;
      rejected_count: number;
    };
    sworn_declaration?: SwornDeclarationSubmission | null;
    modality?: { id: number; code: string; name: string } | null;
    modality2?: { id: number; code: string; name: string } | null;
    country_residence?: { id: number; code?: string | null; name: string } | null;
    country_birth?: { id: number; code?: string | null; name: string } | null;
    ubigeo_residence?: { id: number; department: string; province: string; district: string } | null;
    ubigeo_birth?: { id: number; department: string; province: string; district: string } | null;
    faculty?: { id: number; name: string } | null;
    speciality1?: { id: number; code: string; name: string } | null;
    speciality2?: { id: number; code: string; name: string } | null;
    university?: { id: number; code: string; name: string } | null;
    school?: { id: number; name: string; country_id?: number | null; ubigeo_id?: number | null } | null;
  };
};

export type AdmissionModality = {
  id: number;
  code: string;
  name: string;
  name_regulation: string;
  description: string | null;
  image_url: string | null;
  start_studies: boolean;
  requires_vacancy_right: boolean;
};

export type AdmissionMajor = {
  id: number;
  code: string;
  name: string;
  faculty_id: number;
};

export type AdmissionFaculty = {
  id: number;
  code: string;
  name: string;
  acronym: string;
  majors: AdmissionMajor[];
};

export type TgUniMajorVacancy = {
  id: number;
  period_id: number;
  modality_id: number;
  major_id: number;
  major: AdmissionMajor & {
    faculty?: {
      id: number;
      code: string;
      name: string;
      acronym: string;
    };
  };
  vacancies: number;
  registered_count: number;
  remaining_vacancies: number;
  is_over_capacity: boolean;
};

export type ModalityRequiredDocument = {
  id: number;
  modality_id: number;
  document_code: string;
  document_name: string;
  active: boolean;
};

export type ApplicantUploadedDocument = {
  id: number;
  document_name: string;
  document: string;
  document_url: string | null;
  document_original_name: string;
  status: "pending" | "approved" | "rejected" | string;
  rejection_reason: string | null;
  created_at: string | null;
};

export type FamilyMemberStatus = "available" | "deceased" | "not_present";

export type FamilyMemberType = "father" | "mother" | "guardian";

export type FamilyMember = {
  id: number;
  applicant_id: number;
  type: FamilyMemberType;
  status: FamilyMemberStatus | null;
  names: string | null;
  last_names: string | null;
  dni: string | null;
  address: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  guardian_relation: "father" | "mother" | "third_party" | null;
};

export type FamilyPersonPayload = {
  status: FamilyMemberStatus;
  names: string | null;
  last_names: string | null;
  dni: string | null;
  address: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
};

export type GuardianPayload = {
  enabled: boolean;
  relation: "father" | "mother" | "third_party" | null;
  names: string | null;
  last_names: string | null;
  dni: string | null;
  address: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
};

export type FamilyDataPayload = {
  father: FamilyPersonPayload;
  mother: FamilyPersonPayload;
  guardian: GuardianPayload;
};

export type QuizCatalogOption = {
  id: number;
  name: string;
  code?: string;
};

export type ApplicantQuizData = {
  id?: number;
  mainReasonId: number;
  majorId: number;
  preparationTypeId: number;
  preparationMonths: number;
  familyIncome: string | number;
  sourceId: number;
  socialNetworkId: number | null;
  parentsTeacherCareer: string;
  sisfoh: string;
};

export type SwornDeclarationTemplate =
  | { type: "not_configured" }
  | { type: "text"; text: string | null }
  | { type: "file"; url: string | null };

export type SwornDeclarationSubmission = {
  id: number;
  status: "pending" | "reviewed" | "rejected" | string;
  document_url: string | null;
  rejection_reason?: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
};

export type PreinscriptionConsentData = {
  document: {
    id: number;
    code: string;
    type: string;
    text: string | null;
  } | null;
  accepted: boolean;
  accepted_at: string | null;
};

export type ApplicantPayment = {
  tariff_code: string | null;
  description: string | null;
  amount: string | number;
  original_amount: string | number | null;
  discount_amount: string | number | null;
  discount_type: "partial" | "total" | string | null;
  discount_reason: string | null;
  is_paid: boolean;
  payment_date: string | null;
};

export type ApplicantProspectus = {
  available: boolean;
  is_paid: boolean;
  document_url: string | null;
  message: string;
};

export type SatisfactionSurveyPayload = {
  overall_rating: number;
  ease_rating: number;
  speed_rating: number;
  clarity_rating: number;
  upload_experience_rating: number;
  support_rating: number | null;
  nps_score: number;
  hardest_step: string | null;
  had_technical_issue: boolean;
  technical_issue_detail: string | null;
  improvement_suggestion: string | null;
  would_recommend: boolean | null;
  metadata?: Record<string, unknown> | null;
};

export function getApplicantProgress(token: string) {
  return apiRequest<ApplicantProgress>("/applicants/progress", { token });
}

export function getPreinscriptionConsent(token: string) {
  return apiRequest<{ status: "success"; data: PreinscriptionConsentData }>(
    "/applicants/preinscription-consent",
    { token }
  );
}

export function acceptPreinscriptionConsent(token: string) {
  return apiRequest<{
    status: "success";
    message: string;
    data: { accepted: boolean; accepted_at: string | null };
  }>("/applicants/preinscription-consent", {
    method: "POST",
    body: JSON.stringify({ accepted: true }),
    token,
  });
}

export function getCountries(token: string) {
  return apiRequest<{ status: "success"; data: CatalogOption[] }>("/applicants/countries", {
    token,
  });
}

export function getDocumentTypes(token: string) {
  return apiRequest<{ status: "success"; data: CatalogOption[] }>("/applicants/document-types", {
    token,
  });
}

export function getGenders() {
  return apiRequest<{ status: "success"; data: CatalogOption[] }>("/genders");
}

export function getDepartments() {
  return apiRequest<{ status: "success"; data: UbigeoDepartment[] }>("/ubigeos/departments");
}

export function getProvinces(departmentCode: string) {
  return apiRequest<{ status: "success"; data: UbigeoProvince[] }>(
    `/ubigeos/provinces?department_code=${encodeURIComponent(departmentCode)}`
  );
}

export function getDistricts(provinceCode: string) {
  return apiRequest<{ status: "success"; data: UbigeoDistrict[] }>(
    `/ubigeos/districts?province_code=${encodeURIComponent(provinceCode)}`
  );
}

export function searchSchools(ubigeoId: number, query: string) {
  return apiRequest<{ status: "success"; schools: SchoolOption[] }>(
    `/schools?ubigeo_id=${ubigeoId}&q=${encodeURIComponent(query)}`
  );
}

export function getUbigeo(id: number) {
  return apiRequest<{ status: "success"; data: UbigeoDetail }>(`/ubigeos/${id}`);
}

export function getModalities(hasVacancyRight?: boolean) {
  const query =
    typeof hasVacancyRight === "boolean"
      ? `?has_vacancy_right=${hasVacancyRight ? "1" : "0"}`
      : "";

  return apiRequest<{ status: "success"; modalities: AdmissionModality[] }>(
    `/modalities${query}`
  );
}

export function getFaculties() {
  return apiRequest<{ status: "success"; faculties: AdmissionFaculty[] }>("/faculties");
}

export function getQuizMainReasons() {
  return apiRequest<{ data: QuizCatalogOption[] }>("/quiz/main-reasons");
}

export function getQuizPreparationTypes() {
  return apiRequest<{ data: QuizCatalogOption[] }>("/quiz/preparation-types");
}

export function getQuizSources() {
  return apiRequest<{ data: QuizCatalogOption[] }>("/quiz/sources");
}

export function getQuizSocialNetworks() {
  return apiRequest<{ data: QuizCatalogOption[] }>("/quiz/social-networks");
}

export function getTgUniVacancies() {
  return apiRequest<{
    status: "success";
    period: { id: number; name: string } | null;
    modality: { id: number; code: string; name: string } | null;
    vacancies: TgUniMajorVacancy[];
  }>("/modalities/tg-uni-vacancies");
}

export function getModalityDocuments(modalityId: number) {
  return apiRequest<{ status: "success"; data: ModalityRequiredDocument[] }>(
    `/modality-documents?modality_id=${modalityId}`
  );
}

export function getApplicantDocuments(token: string) {
  return apiRequest<{ status: "success"; data: ApplicantUploadedDocument[] }>(
    "/applicants/documents",
    { token }
  );
}

export type ModalityDataPayload = {
  has_vacancy_right: boolean;
  modality_id: number;
  faculty_id: number;
  speciality1_id: number;
  speciality2_id: number | null;
  university_id?: number | null;
  school_id?: number | null;
  school_country_id: number;
  school_ubigeo_id?: number | null;
  school_name?: string | null;
};

export function saveModalityData(token: string, payload: ModalityDataPayload) {
  return apiRequest<{ status: "success"; message: string; applicant: unknown }>(
    "/applicants/modality-data",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }
  );
}

export function saveApplicantPersonalData(token: string, payload: ApplicantPersonalDataPayload) {
  return apiRequest<{ status: "success"; message: string; applicant: unknown }>(
    "/applicants/personal-data",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }
  );
}

export function uploadApplicantPhoto(token: string, photo: File) {
  if (photo.size === 0) {
    throw new Error("El archivo de foto esta vacio.");
  }

  const formData = new FormData();
  formData.append("photo", photo);

  return apiRequest<{ status: "success"; message: string; photo: unknown }>("/applicants/photo", {
    method: "POST",
    body: formData,
    token,
  });
}

export function uploadIdentityDocument(token: string, document: File) {
  const formData = new FormData();
  formData.append("document", document);

  return apiRequest<{ status: "success"; message: string; document: unknown }>(
    "/applicants/identity-document",
    {
      method: "POST",
      body: formData,
      token,
    }
  );
}

export function uploadApplicantDocument(token: string, documentName: string, document: File) {
  const formData = new FormData();
  formData.append("document_name", documentName);
  formData.append("document", document);

  return apiRequest<{
    status: "success";
    message: string;
    document: ApplicantUploadedDocument;
  }>("/applicants/documents", {
    method: "POST",
    body: formData,
    token,
  });
}

export function getFamilyData(token: string) {
  return apiRequest<{ status: "success"; family_members: FamilyMember[] }>(
    "/applicants/family-data",
    { token }
  );
}

export function saveFamilyData(token: string, payload: FamilyDataPayload) {
  return apiRequest<{ status: "success"; message: string; family_members: FamilyMember[] }>(
    "/applicants/family-data",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }
  );
}

export function getApplicantQuiz(token: string) {
  return apiRequest<{ status: "success"; quiz: ApplicantQuizData | null }>("/applicants/quiz", {
    token,
  });
}

export function saveApplicantQuiz(token: string, payload: ApplicantQuizData) {
  return apiRequest<{ status: "success"; message: string; quiz: unknown }>("/applicants/quiz", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export function getSwornDeclaration(token: string) {
  return apiRequest<{
    status: "success";
    data: {
      template: SwornDeclarationTemplate;
      submission: SwornDeclarationSubmission | null;
    };
  }>("/applicants/sworn-declaration", { token });
}

export function uploadSwornDeclaration(token: string, document: File) {
  const formData = new FormData();
  formData.append("document", document);

  return apiRequest<{
    status: "success";
    message: string;
    data: SwornDeclarationSubmission;
  }>("/applicants/sworn-declaration", {
    method: "POST",
    body: formData,
    token,
  });
}

export function getApplicantPayments(token: string) {
  return apiRequest<{ status: "success"; data: ApplicantPayment[] }>("/applicants/payments", {
    token,
  });
}

export function getApplicantProspectus(token: string) {
  return apiRequest<{ status: "success"; data: ApplicantProspectus }>("/applicants/prospectus", {
    token,
  });
}

export async function downloadApplicantFicha(token: string) {
  const response = await fetch(`${API_BASE_URL}/applicants/ficha`, {
    headers: {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "No se pudo descargar la ficha.";

    try {
      const data = (await response.json()) as { message?: string };
      message = data.message ?? message;
    } catch {
      // The server may return a non-JSON error page if PDF generation fails unexpectedly.
    }

    throw new ApiError(message, response.status);
  }

  return response.blob();
}

export function confirmApplicantData(token: string) {
  return apiRequest<{ status: "success"; message: string }>("/applicants/confirm-data", {
    method: "POST",
    body: JSON.stringify({ confirm_correct_data: true }),
    token,
  });
}

export function getSatisfactionSurvey(token: string) {
  return apiRequest<{ status: "success"; data: unknown | null }>(
    "/applicants/satisfaction-survey",
    { token }
  );
}

export function saveSatisfactionSurvey(token: string, payload: SatisfactionSurveyPayload) {
  return apiRequest<{ status: "success"; message: string; data: unknown }>(
    "/applicants/satisfaction-survey",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }
  );
}
