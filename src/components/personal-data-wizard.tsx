"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken, getStoredAuthUser } from "@/lib/auth";
import {
  ApplicantPersonalDataPayload,
  CatalogOption,
  UbigeoDepartment,
  UbigeoDistrict,
  UbigeoProvince,
  getApplicantProgress,
  getCountries,
  getDepartments,
  getDistricts,
  getDocumentTypes,
  getGenders,
  getProvinces,
  getUbigeo,
  saveApplicantPersonalData,
  uploadApplicantPhoto,
  uploadIdentityDocument,
} from "@/lib/applicant";

type InternalStep = 1 | 2 | 3;
type UbigeoGroup = "residence" | "birth";
type DocumentType = "DNI" | "CE" | "PASSPORT";

type FormState = {
  documentType: DocumentType;
  documentNumber: string;
  fatherLastName: string;
  motherLastName: string;
  names: string;
  email: string;
  genderId: string;
  applicantPhone: string;
  guardianPhone: string;
  otherPhone: string;
  countryResidenceId: string;
  ubigeoResidenceId: string;
  birthDate: string;
  address: string;
  secondaryStartYear: string;
  secondaryEndYear: string;
  countryBirthId: string;
  ubigeoBirthId: string;
  hasDisability: boolean;
  disabilityDescription: string;
};

const initialFormState: FormState = {
  documentType: "DNI",
  documentNumber: "",
  fatherLastName: "",
  motherLastName: "",
  names: "",
  email: "",
  genderId: "",
  applicantPhone: "",
  guardianPhone: "",
  otherPhone: "",
  countryResidenceId: "",
  ubigeoResidenceId: "",
  birthDate: "",
  address: "",
  secondaryStartYear: "",
  secondaryEndYear: "",
  countryBirthId: "",
  ubigeoBirthId: "",
  hasDisability: false,
  disabilityDescription: "",
};

const DOCUMENT_RULES: Record<DocumentType, { label: string; pattern: RegExp; message: string; maxLength: number }> = {
  DNI: {
    label: "DNI",
    pattern: /^\d{8}$/,
    message: "El DNI debe tener exactamente 8 digitos numericos.",
    maxLength: 8,
  },
  CE: {
    label: "Carne de Extranjeria",
    pattern: /^\d{9}$/,
    message: "El Carne de Extranjeria debe tener exactamente 9 digitos numericos.",
    maxLength: 9,
  },
  PASSPORT: {
    label: "Pasaporte",
    pattern: /^[A-Za-z0-9]{8,12}$/,
    message: "El pasaporte debe tener entre 8 y 12 caracteres alfanumericos.",
    maxLength: 12,
  },
};

const PHONE_PATTERN = /^\d{9}$/;

function isSupportedDocumentType(code?: string): code is DocumentType {
  return code === "DNI" || code === "CE" || code === "PASSPORT";
}

function normalizeDocumentNumber(type: DocumentType, value: string) {
  const rule = DOCUMENT_RULES[type];

  if (type === "PASSPORT") {
    return value.replace(/[^A-Za-z0-9]/g, "").slice(0, rule.maxLength);
  }

  return value.replace(/\D/g, "").slice(0, rule.maxLength);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 9);
}

function isPeruCountry(country?: CatalogOption): boolean {
  if (!country) {
    return false;
  }

  const code = country.code?.toUpperCase();
  const name = country.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  return code === "PE" || name === "PERU";
}

type PersonalDataWizardProps = {
  initialStep?: InternalStep;
};

const STEP_TITLES: Record<InternalStep, string> = {
  1: "Datos personales del postulante",
  2: "Foto del postulante",
  3: "Documento de identidad",
};

const STEP_LABELS: Record<InternalStep, string> = {
  1: "Paso 2 de 12",
  2: "Paso 5 de 12",
  3: "Paso 3 de 12",
};

export default function PersonalDataWizard({ initialStep = 1 }: PersonalDataWizardProps) {
  const router = useRouter();
  const [step] = useState<InternalStep>(initialStep);
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [documentTypes, setDocumentTypes] = useState<Array<CatalogOption & { code: DocumentType }>>([]);
  const [genders, setGenders] = useState<CatalogOption[]>([]);
  const [countries, setCountries] = useState<CatalogOption[]>([]);
  const [departments, setDepartments] = useState<UbigeoDepartment[]>([]);
  const [residenceProvinces, setResidenceProvinces] = useState<UbigeoProvince[]>([]);
  const [birthProvinces, setBirthProvinces] = useState<UbigeoProvince[]>([]);
  const [residenceDistricts, setResidenceDistricts] = useState<UbigeoDistrict[]>([]);
  const [birthDistricts, setBirthDistricts] = useState<UbigeoDistrict[]>([]);
  const [residenceDepartment, setResidenceDepartment] = useState("");
  const [birthDepartment, setBirthDepartment] = useState("");
  const [residenceProvince, setResidenceProvince] = useState("");
  const [birthProvince, setBirthProvince] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [identityDocumentComplete, setIdentityDocumentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const residenceCountry = useMemo(
    () => countries.find((country) => String(country.id) === form.countryResidenceId),
    [countries, form.countryResidenceId]
  );
  const birthCountry = useMemo(
    () => countries.find((country) => String(country.id) === form.countryBirthId),
    [countries, form.countryBirthId]
  );
  const documentRule = DOCUMENT_RULES[form.documentType];
  const shouldShowResidenceUbigeo = isPeruCountry(residenceCountry);
  const shouldShowBirthUbigeo = isPeruCountry(birthCountry);

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    const storedUser = getStoredAuthUser();

    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    if (storedUser) {
      const user = storedUser;
      setForm((prev) => ({
        ...prev,
        email: user.email,
        fatherLastName: prev.fatherLastName || user.paternal_surname || "",
        motherLastName: prev.motherLastName || user.maternal_surname || "",
        names: prev.names || user.names || user.name,
      }));
    }

    Promise.all([
      getDocumentTypes(storedToken),
      getGenders(),
      getCountries(storedToken),
      getDepartments(),
      getApplicantProgress(storedToken),
    ])
      .then(async ([documentTypeResponse, genderResponse, countryResponse, departmentResponse, progressResponse]) => {
        const availableDocumentTypes = documentTypeResponse.data.filter(
          (type): type is CatalogOption & { code: DocumentType } => isSupportedDocumentType(type.code)
        );
        const applicant = progressResponse.applicant;
        const applicantDocumentType = applicant?.document_type?.code;
        const nextDocumentType = availableDocumentTypes.some((type) => type.code === applicantDocumentType)
          ? (applicantDocumentType as DocumentType)
          : availableDocumentTypes[0]?.code ?? "DNI";

        setDocumentTypes(availableDocumentTypes);
        setGenders(genderResponse.data);
        setCountries(countryResponse.data);
        setDepartments(departmentResponse.data);

        setIdentityDocumentComplete(Boolean(progressResponse.progress.identity_document_complete));

        if (!applicant) {
          setForm((prev) => ({ ...prev, documentType: nextDocumentType, documentNumber: "" }));
        } else {
          setForm((prev) => ({
            ...prev,
            documentType: nextDocumentType,
            documentNumber: applicant.document_number ?? "",
            fatherLastName: applicant.paternal_surname ?? "",
            motherLastName: applicant.maternal_surname ?? "",
            names: applicant.names ?? prev.names,
            email: applicant.email ?? prev.email,
            genderId: applicant.gender_id ? String(applicant.gender_id) : "",
            applicantPhone: applicant.cellular_phone ?? "",
            guardianPhone: applicant.phone ?? "",
            otherPhone: applicant.other_phone ?? "",
            countryResidenceId: applicant.country_residence_id
              ? String(applicant.country_residence_id)
              : "",
            ubigeoResidenceId: applicant.ubigeo_residence_id
              ? String(applicant.ubigeo_residence_id)
              : "",
            birthDate: applicant.date_birth?.slice(0, 10) ?? "",
            address: applicant.direction ?? "",
            secondaryStartYear: applicant.start_study ? String(applicant.start_study) : "",
            secondaryEndYear: applicant.end_study ? String(applicant.end_study) : "",
            countryBirthId: applicant.country_birth_id ? String(applicant.country_birth_id) : "",
            ubigeoBirthId: applicant.ubigeo_birth_id ? String(applicant.ubigeo_birth_id) : "",
            hasDisability: Boolean(applicant.has_disability),
            disabilityDescription: applicant.disability_description ?? "",
          }));

          if (applicant.ubigeo_residence_id) {
            await hydrateUbigeo("residence", applicant.ubigeo_residence_id);
          }

          if (applicant.ubigeo_birth_id) {
            await hydrateUbigeo("birth", applicant.ubigeo_birth_id);
          }
        }
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar los catalogos del formulario."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const hydrateUbigeo = async (group: UbigeoGroup, ubigeoId: number) => {
    const detailResponse = await getUbigeo(ubigeoId);
    const code = detailResponse.data.code;
    const departmentCode = `${code.slice(0, 2)}0000`;
    const provinceCode = `${code.slice(0, 4)}00`;
    const [provinceResponse, districtResponse] = await Promise.all([
      getProvinces(departmentCode),
      getDistricts(provinceCode),
    ]);

    if (group === "residence") {
      setResidenceDepartment(departmentCode);
      setResidenceProvince(provinceCode);
      setResidenceProvinces(provinceResponse.data);
      setResidenceDistricts(districtResponse.data);
    } else {
      setBirthDepartment(departmentCode);
      setBirthProvince(provinceCode);
      setBirthProvinces(provinceResponse.data);
      setBirthDistricts(districtResponse.data);
    }
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const firstFieldError = (field: string) => fieldErrors[field]?.[0] ?? null;

  const validatePersonalData = () => {
    const nextErrors: Record<string, string[]> = {};
    const documentRule = DOCUMENT_RULES[form.documentType];
    const documentNumber = form.documentNumber.trim();
    const applicantPhone = form.applicantPhone.trim();
    const guardianPhone = form.guardianPhone.trim();
    const otherPhone = form.otherPhone.trim();

    if (!documentRule.pattern.test(documentNumber)) {
      nextErrors.documentNumber = [documentRule.message];
    }

    if (!PHONE_PATTERN.test(applicantPhone)) {
      nextErrors.applicantPhone = ["El celular del postulante debe tener exactamente 9 digitos."];
    }

    if (guardianPhone && !PHONE_PATTERN.test(guardianPhone)) {
      nextErrors.guardianPhone = ["El telefono de apoderado debe tener exactamente 9 digitos."];
    }

    if (!PHONE_PATTERN.test(otherPhone)) {
      nextErrors.otherPhone = ["El telefono alterno debe tener exactamente 9 digitos."];
    }

    return nextErrors;
  };

  const selectDepartment = async (group: UbigeoGroup, code: string) => {
    if (group === "residence") {
      setResidenceDepartment(code);
      setResidenceProvince("");
      setResidenceDistricts([]);
      updateField("ubigeoResidenceId", "");
    } else {
      setBirthDepartment(code);
      setBirthProvince("");
      setBirthDistricts([]);
      updateField("ubigeoBirthId", "");
    }

    if (!code) {
      if (group === "residence") {
        setResidenceProvinces([]);
      } else {
        setBirthProvinces([]);
      }
      return;
    }

    const response = await getProvinces(code);
    if (group === "residence") {
      setResidenceProvinces(response.data);
    } else {
      setBirthProvinces(response.data);
    }
  };

  const selectProvince = async (group: UbigeoGroup, code: string) => {
    if (group === "residence") {
      setResidenceProvince(code);
      updateField("ubigeoResidenceId", "");
    } else {
      setBirthProvince(code);
      updateField("ubigeoBirthId", "");
    }

    if (!code) {
      if (group === "residence") {
        setResidenceDistricts([]);
      } else {
        setBirthDistricts([]);
      }
      return;
    }

    const response = await getDistricts(code);
    if (group === "residence") {
      setResidenceDistricts(response.data);
    } else {
      setBirthDistricts(response.data);
    }
  };

  const handleInput =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      updateField(field, event.target.value as never);
    };

  const handleDocumentTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      documentType: event.target.value as DocumentType,
      documentNumber: "",
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.documentType;
      delete next.documentNumber;
      return next;
    });
  };

  const handleDocumentNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("documentNumber", normalizeDocumentNumber(form.documentType, event.target.value));
  };

  const handlePhoneInput =
    (field: "applicantPhone" | "guardianPhone" | "otherPhone") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, normalizePhone(event.target.value));
    };

  const handleCountryChange =
    (field: "countryResidenceId" | "countryBirthId", group: UbigeoGroup) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      updateField(field, value);

      const selectedCountry = countries.find((country) => String(country.id) === value);
      if (isPeruCountry(selectedCountry)) {
        return;
      }

      if (group === "residence") {
        setResidenceDepartment("");
        setResidenceProvince("");
        setResidenceProvinces([]);
        setResidenceDistricts([]);
        updateField("ubigeoResidenceId", "");
      } else {
        setBirthDepartment("");
        setBirthProvince("");
        setBirthProvinces([]);
        setBirthDistricts([]);
        updateField("ubigeoBirthId", "");
      }
    };

  const buildPayload = (): ApplicantPersonalDataPayload => ({
    documentType: form.documentType,
    documentNumber: form.documentNumber.trim(),
    fatherLastName: form.fatherLastName.trim(),
    motherLastName: form.motherLastName.trim(),
    names: form.names.trim(),
    email: form.email.trim(),
    genderId: Number(form.genderId),
    applicantPhone: form.applicantPhone.trim(),
    guardianPhone: form.guardianPhone.trim() || null,
    otherPhone: form.otherPhone.trim(),
    countryResidenceId: Number(form.countryResidenceId),
    ubigeoResidenceId: shouldShowResidenceUbigeo ? Number(form.ubigeoResidenceId) : null,
    birthDate: form.birthDate,
    address: form.address.trim(),
    secondaryStartYear: Number(form.secondaryStartYear),
    secondaryEndYear: Number(form.secondaryEndYear),
    countryBirthId: Number(form.countryBirthId),
    ubigeoBirthId: shouldShowBirthUbigeo ? Number(form.ubigeoBirthId) : null,
    hasDisability: form.hasDisability,
    disabilityDescription: form.hasDisability ? form.disabilityDescription.trim() || null : null,
  });

  const handlePersonalDataSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setMessage(null);
    setFieldErrors({});

    const localErrors = validatePersonalData();
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError("Revise los campos marcados. Falta completar o corregir información obligatoria.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await saveApplicantPersonalData(token, buildPayload());
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Datos personales guardados correctamente.");
      router.push("/identity-document");
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
        setFieldErrors(caughtError.errors ?? {});
      } else {
        setError("No se pudo guardar los datos personales.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!photo) {
      setError("Seleccione la foto del postulante antes de continuar.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await uploadApplicantPhoto(token, photo);
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Foto guardada correctamente.");
      router.push("/modality");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo subir la foto."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentityDocumentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!identityDocument) {
      setError("Seleccione el documento de identidad antes de continuar.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await uploadIdentityDocument(token, identityDocument);
      setIdentityDocumentComplete(true);
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Documento de identidad guardado correctamente.");
      router.push("/sworn-affidavit");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo subir el documento de identidad."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando datos del formulario...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          {STEP_LABELS[step]}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          {STEP_TITLES[step]}
        </h1>
      </header>

      {step === 1 && (
        <div className="mb-6 rounded-lg border border-[#711610]/30 bg-[#E6D9AA]/35 p-4 text-sm text-[#711610]">
          <p className="font-semibold">Importante</p>
          <p>Complete solo los datos del postulante. No registrar datos del padre, madre o apoderado.</p>
        </div>
      )}

      {(error || message) && (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {step === 1 && (
        <form
          onSubmit={handlePersonalDataSubmit}
          className="rounded-lg border border-[#9A999D]/30 bg-white p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tipo de documento" error={firstFieldError("documentType")}>
              <select
                value={form.documentType}
                onChange={handleDocumentTypeChange}
                className="form-input"
                required
              >
                {documentTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {DOCUMENT_RULES[type.code].label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Numero de documento" error={firstFieldError("documentNumber")}>
              <input
                type="text"
                value={form.documentNumber}
                onChange={handleDocumentNumberChange}
                className="form-input"
                inputMode={form.documentType === "PASSPORT" ? "text" : "numeric"}
                maxLength={documentRule.maxLength}
                placeholder={
                  form.documentType === "DNI"
                    ? "12345678"
                    : form.documentType === "CE"
                      ? "123456789"
                      : "PA123456"
                }
                required
              />
            </Field>

            <Field label="Apellido paterno" error={firstFieldError("fatherLastName")}>
              <input
                type="text"
                value={form.fatherLastName}
                onChange={handleInput("fatherLastName")}
                className="form-input"
                maxLength={50}
                required
              />
            </Field>

            <Field label="Apellido materno" error={firstFieldError("motherLastName")}>
              <input
                type="text"
                value={form.motherLastName}
                onChange={handleInput("motherLastName")}
                className="form-input"
                maxLength={50}
                required
              />
            </Field>

            <Field label="Nombres" error={firstFieldError("names")}>
              <input
                type="text"
                value={form.names}
                onChange={handleInput("names")}
                className="form-input"
                maxLength={100}
                required
              />
            </Field>

            <Field label="Correo electronico" error={firstFieldError("email")}>
              <input
                type="email"
                value={form.email}
                onChange={handleInput("email")}
                className="form-input"
                maxLength={100}
                required
              />
            </Field>

            <Field label="Genero" error={firstFieldError("genderId")}>
              <select value={form.genderId} onChange={handleInput("genderId")} className="form-input" required>
                <option value="">Seleccione</option>
                {genders.map((gender) => (
                  <option key={gender.id} value={gender.id}>
                    {gender.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fecha de nacimiento" error={firstFieldError("birthDate")}>
              <input
                type="date"
                value={form.birthDate}
                onChange={handleInput("birthDate")}
                className="form-input"
                required
              />
            </Field>

            <Field label="Celular del postulante" error={firstFieldError("applicantPhone")}>
              <input
                type="tel"
                value={form.applicantPhone}
                onChange={handlePhoneInput("applicantPhone")}
                className="form-input"
                inputMode="numeric"
                maxLength={9}
                pattern="[0-9]{9}"
                required
              />
            </Field>

            <Field label="Telefono de apoderado" error={firstFieldError("guardianPhone")}>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={handlePhoneInput("guardianPhone")}
                className="form-input"
                inputMode="numeric"
                maxLength={9}
                pattern="[0-9]{9}"
              />
            </Field>

            <Field label="Telefono alterno" error={firstFieldError("otherPhone")}>
              <input
                type="tel"
                value={form.otherPhone}
                onChange={handlePhoneInput("otherPhone")}
                className="form-input"
                inputMode="numeric"
                maxLength={9}
                pattern="[0-9]{9}"
                required
              />
            </Field>

            <Field label="Pais de residencia" error={firstFieldError("countryResidenceId")}>
              <CountrySelect
                value={form.countryResidenceId}
                countries={countries}
                onChange={handleCountryChange("countryResidenceId", "residence")}
              />
            </Field>

            {shouldShowResidenceUbigeo && (
              <UbigeoSelector
                title="Ubigeo de residencia"
                departments={departments}
                provinces={residenceProvinces}
                districts={residenceDistricts}
                department={residenceDepartment}
                province={residenceProvince}
                district={form.ubigeoResidenceId}
                districtError={firstFieldError("ubigeoResidenceId")}
                onDepartmentChange={(code) => selectDepartment("residence", code)}
                onProvinceChange={(code) => selectProvince("residence", code)}
                onDistrictChange={(value) => updateField("ubigeoResidenceId", value)}
              />
            )}

            <Field label="Direccion" error={firstFieldError("address")}>
              <input
                type="text"
                value={form.address}
                onChange={handleInput("address")}
                className="form-input"
                maxLength={255}
                required
              />
            </Field>

            <Field label="Año inicio secundaria" error={firstFieldError("secondaryStartYear")}>
              <input
                type="number"
                value={form.secondaryStartYear}
                onChange={handleInput("secondaryStartYear")}
                className="form-input"
                min={1950}
                max={2100}
                placeholder={String(currentYear - 5)}
                required
              />
            </Field>

            <Field label="Año fin secundaria" error={firstFieldError("secondaryEndYear")}>
              <input
                type="number"
                value={form.secondaryEndYear}
                onChange={handleInput("secondaryEndYear")}
                className="form-input"
                min={1950}
                max={2100}
                placeholder={String(currentYear - 1)}
                required
              />
            </Field>

            <Field label="Pais de nacimiento" error={firstFieldError("countryBirthId")}>
              <CountrySelect
                value={form.countryBirthId}
                countries={countries}
                onChange={handleCountryChange("countryBirthId", "birth")}
              />
            </Field>

            {shouldShowBirthUbigeo && (
              <UbigeoSelector
                title="Ubigeo de nacimiento"
                departments={departments}
                provinces={birthProvinces}
                districts={birthDistricts}
                department={birthDepartment}
                province={birthProvince}
                district={form.ubigeoBirthId}
                districtError={firstFieldError("ubigeoBirthId")}
                onDepartmentChange={(code) => selectDepartment("birth", code)}
                onProvinceChange={(code) => selectProvince("birth", code)}
                onDistrictChange={(value) => updateField("ubigeoBirthId", value)}
              />
            )}

            <div className="rounded-md border border-[#9A999D]/30 p-4 md:col-span-2">
              <label className="flex items-center gap-3 text-sm font-medium text-[#711610]">
                <input
                  type="checkbox"
                  checked={form.hasDisability}
                  onChange={(event) => updateField("hasDisability", event.target.checked)}
                  className="h-4 w-4 rounded border-[#9A999D]"
                />
                Presenta discapacidad
              </label>

              {form.hasDisability && (
                <Field
                  label="Descripcion de discapacidad"
                  error={firstFieldError("disabilityDescription")}
                  className="mt-4"
                >
                  <textarea
                    value={form.disabilityDescription}
                    onChange={handleInput("disabilityDescription")}
                    className="form-input min-h-[150px] resize-y"
                    maxLength={255}
                    required
                  />
                </Field>
              )}
            </div>
          </div>

          <WizardFooter
            backHref="/my-profile"
            submitLabel="Guardar y continuar"
            isSubmitting={isSubmitting}
          />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePhotoSubmit} className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div className="mb-4 rounded-md border border-[#E6D9AA] bg-[#E6D9AA]/20 px-4 py-3 text-sm leading-6 text-[#711610]">
            <p className="font-semibold">Indicaciones para la foto</p>
            <p>
              Debe tener fondo blanco, mostrar al postulante desde los hombros hacia arriba,
              sin gafas, sin gorros y sin cabello cubriendo el rostro.
            </p>
          </div>
          <label className="block cursor-pointer rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610] transition hover:border-[#711610] hover:bg-[#E6D9AA]/30">
            <p className="font-medium">Cargar foto del postulante</p>
            <p className="mt-1 text-[#9A999D]">Formatos permitidos: JPG, JPEG o PNG. Maximo 2 MB.</p>
            <p className="mt-3 rounded-md bg-white/80 px-4 py-3 font-semibold text-[#711610]">
              Haz clic en cualquier parte de este cuadro para seleccionar la foto.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="sr-only"
              required
            />

            {photo && (
              <div className="mx-auto mt-5 grid max-w-xl gap-4 rounded-lg border border-[#9A999D]/30 bg-white p-4 text-left md:grid-cols-[160px_1fr]">
                <div className="flex h-48 w-40 items-center justify-center overflow-hidden rounded-md border border-[#9A999D]/30 bg-[#E6D9AA]/20">
                  {photoPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreviewUrl}
                      alt="Previsualizacion de la foto seleccionada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[#9A999D]">Sin previsualizacion</span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-[#711610]">Foto seleccionada</p>
                  <p>
                    <span className="font-medium">Archivo:</span> {photo.name}
                  </p>
                  <p>
                    <span className="font-medium">Tipo:</span> {photo.type || "No identificado"}
                  </p>
                  <p>
                    <span className="font-medium">Tamano:</span>{" "}
                    {(photo.size / 1024).toFixed(1)} KB
                  </p>
                  {photo.size === 0 && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                      Este archivo esta vacio. Seleccione otra foto.
                    </p>
                  )}
                  <p className="rounded-md bg-[#E6D9AA]/30 px-3 py-2 text-[#711610]">
                    La foto quedara pendiente de evaluacion administrativa, pero puedes continuar con tu inscripcion.
                  </p>
                </div>
              </div>
            )}
          </label>

          <WizardFooter
            backHref="/sworn-affidavit"
            submitLabel="Subir foto"
            isSubmitting={isSubmitting}
            disabled={!photo || photo.size === 0}
          />
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={handleIdentityDocumentSubmit}
          className="rounded-lg border border-[#9A999D]/30 bg-white p-5"
        >
          <div className="mb-4 rounded-md border border-[#E6D9AA] bg-[#E6D9AA]/20 px-4 py-3 text-sm leading-6 text-[#711610]">
            <p className="font-semibold">Indicaciones para el documento de identidad</p>
            <p>
              Para DNI, sube la parte delantera y posterior en un solo archivo PDF. Si usas
              carné de extranjería o pasaporte, sube el documento completo en un solo archivo.
            </p>
          </div>
          <label className="block cursor-pointer rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610] transition hover:border-[#711610] hover:bg-[#E6D9AA]/30">
            <p className="font-medium">Cargar DNI, carne de extranjeria o pasaporte del postulante</p>
            <p className="mt-1 text-[#9A999D]">Formatos permitidos: JPG, JPEG, PNG o PDF. Maximo 5 MB.</p>
            <p className="mt-3 rounded-md bg-white/80 px-4 py-3 font-semibold text-[#711610]">
              Haz clic en cualquier parte de este cuadro para seleccionar el archivo.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(event) => {
                setIdentityDocument(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="sr-only"
              required={!identityDocumentComplete}
            />

            {identityDocument ? (
              <div className="mx-auto mt-5 max-w-xl rounded-lg border border-[#9A999D]/30 bg-white p-4 text-left text-sm">
                <p className="font-semibold text-[#711610]">Documento seleccionado</p>
                <p className="mt-2">
                  <span className="font-medium">Archivo:</span> {identityDocument.name}
                </p>
                <p>
                  <span className="font-medium">Tipo:</span>{" "}
                  {identityDocument.type || "No identificado"}
                </p>
                <p>
                  <span className="font-medium">Tamano:</span>{" "}
                  {(identityDocument.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <p className="mx-auto mt-5 max-w-xl rounded-md bg-[#E6D9AA]/30 px-3 py-2 text-sm text-[#711610]">
                Seleccione su documento de identidad para habilitar el boton de continuar.
              </p>
            )}
          </label>

          <WizardFooter
            backHref="/personal-data"
            extraAction={
              identityDocumentComplete ? (
                <button
                  type="button"
                  onClick={() => router.push("/sworn-affidavit")}
                  className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
                >
                  Continuar a declaración jurada
                </button>
              ) : null
            }
            submitLabel="Subir documento y continuar"
            isSubmitting={isSubmitting}
            disabled={!identityDocument || identityDocument.size === 0}
          />
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

function CountrySelect({
  value,
  countries,
  onChange,
}: {
  value: string;
  countries: CatalogOption[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select value={value} onChange={onChange} className="form-input" required>
      <option value="">Seleccione</option>
      {countries.map((country) => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      ))}
    </select>
  );
}

function UbigeoSelector({
  title,
  departments,
  provinces,
  districts,
  department,
  province,
  district,
  districtError,
  onDepartmentChange,
  onProvinceChange,
  onDistrictChange,
}: {
  title: string;
  departments: UbigeoDepartment[];
  provinces: UbigeoProvince[];
  districts: UbigeoDistrict[];
  department: string;
  province: string;
  district: string;
  districtError?: string | null;
  onDepartmentChange: (code: string) => void;
  onProvinceChange: (code: string) => void;
  onDistrictChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-md border border-[#9A999D]/30 p-4 md:col-span-2">
      <legend className="px-1 text-sm font-semibold text-[#711610]">{title}</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Departamento">
          <select
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className="form-input"
            required
          >
            <option value="">Seleccione</option>
            {departments.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Provincia">
          <select
            value={province}
            onChange={(event) => onProvinceChange(event.target.value)}
            className="form-input"
            disabled={!department}
            required
          >
            <option value="">Seleccione</option>
            {provinces.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Distrito" error={districtError}>
          <select
            value={district}
            onChange={(event) => onDistrictChange(event.target.value)}
            className="form-input"
            disabled={!province}
            required
          >
            <option value="">Seleccione</option>
            {districts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </fieldset>
  );
}

function WizardFooter({
  backHref,
  onBack,
  submitLabel,
  isSubmitting,
  disabled = false,
  extraAction,
}: {
  backHref?: string;
  onBack?: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  extraAction?: React.ReactNode;
}) {
  return (
    <footer className="mt-6 flex items-center justify-between gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          Regresar
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          Regresar
        </button>
      )}

      <div className="flex items-center gap-3">
        {extraAction}
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
        >
          {isSubmitting ? "Procesando..." : submitLabel}
        </button>
      </div>
    </footer>
  );
}
