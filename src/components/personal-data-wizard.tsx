"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AuthUser } from "@/lib/auth";
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
  getGenders,
  getProvinces,
  getUbigeo,
  saveApplicantPersonalData,
  uploadApplicantPhoto,
  uploadIdentityDocument,
} from "@/lib/applicant";

type InternalStep = 1 | 2 | 3;
type UbigeoGroup = "residence" | "birth";

type FormState = {
  documentType: "DNI" | "PASSPORT";
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

export default function PersonalDataWizard() {
  const router = useRouter();
  const [step, setStep] = useState<InternalStep>(1);
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
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
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    if (storedUser) {
      const user = JSON.parse(storedUser) as AuthUser;
      setForm((prev) => ({
        ...prev,
        email: user.email,
        names: prev.names || user.name,
      }));
    }

    Promise.all([
      getGenders(),
      getCountries(storedToken),
      getDepartments(),
      getApplicantProgress(storedToken),
    ])
      .then(async ([genderResponse, countryResponse, departmentResponse, progressResponse]) => {
        setGenders(genderResponse.data);
        setCountries(countryResponse.data);
        setDepartments(departmentResponse.data);

        const applicant = progressResponse.applicant;
        setIdentityDocumentComplete(Boolean(progressResponse.progress.identity_document_complete));

        if (applicant) {
          setForm((prev) => ({
            ...prev,
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
    setIsSubmitting(true);

    try {
      await saveApplicantPersonalData(token, buildPayload());
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Datos personales guardados correctamente.");
      setStep(2);
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
    if (!token || !photo) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await uploadApplicantPhoto(token, photo);
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Foto guardada correctamente.");
      setStep(3);
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
    if (!token || !identityDocument) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await uploadIdentityDocument(token, identityDocument);
      setIdentityDocumentComplete(true);
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Documento de identidad guardado correctamente.");
      router.push("/modality");
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

  const goBack = () => setStep((prev) => (prev > 1 ? ((prev - 1) as InternalStep) : prev));

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
          Paso interno {step} de 3
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Datos personales del postulante
        </h1>
      </header>

      <div className="mb-6 rounded-lg border border-[#711610]/30 bg-[#E6D9AA]/35 p-4 text-sm text-[#711610]">
        <p className="font-semibold">Importante</p>
        <p>Complete solo los datos del postulante. No registrar datos del padre, madre o apoderado.</p>
      </div>

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
                onChange={(event) => updateField("documentType", event.target.value as "DNI" | "PASSPORT")}
                className="form-input"
                required
              >
                <option value="DNI">DNI</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </Field>

            <Field label="Numero de documento" error={firstFieldError("documentNumber")}>
              <input
                type="text"
                value={form.documentNumber}
                onChange={handleInput("documentNumber")}
                className="form-input"
                maxLength={20}
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
                onChange={handleInput("applicantPhone")}
                className="form-input"
                maxLength={30}
                required
              />
            </Field>

            <Field label="Telefono de apoderado" error={firstFieldError("guardianPhone")}>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={handleInput("guardianPhone")}
                className="form-input"
                maxLength={30}
              />
            </Field>

            <Field label="Telefono alterno" error={firstFieldError("otherPhone")}>
              <input
                type="tel"
                value={form.otherPhone}
                onChange={handleInput("otherPhone")}
                className="form-input"
                maxLength={30}
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

            <Field label="Anio inicio secundaria" error={firstFieldError("secondaryStartYear")}>
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

            <Field label="Anio fin secundaria" error={firstFieldError("secondaryEndYear")}>
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
            backHref="/login-registro"
            submitLabel="Guardar y continuar"
            isSubmitting={isSubmitting}
          />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePhotoSubmit} className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div className="rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610]">
            <p className="font-medium">Cargar foto del postulante</p>
            <p className="mt-1 text-[#9A999D]">Formatos permitidos: JPG, JPEG o PNG. Maximo 2 MB.</p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="mx-auto mt-4 block w-full max-w-xs text-sm"
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
          </div>

          <WizardFooter
            onBack={goBack}
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
          <div className="rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610]">
            <p className="font-medium">Cargar DNI o pasaporte del postulante</p>
            <p className="mt-1 text-[#9A999D]">Formatos permitidos: JPG, JPEG, PNG o PDF. Maximo 5 MB.</p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(event) => {
                setIdentityDocument(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="mx-auto mt-4 block w-full max-w-xs text-sm"
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
                Seleccione su DNI o pasaporte para habilitar el boton de continuar.
              </p>
            )}
          </div>

          <WizardFooter
            onBack={goBack}
            extraAction={
              identityDocumentComplete ? (
                <button
                  type="button"
                  onClick={() => router.push("/modality")}
                  className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
                >
                  Continuar a modalidad
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
