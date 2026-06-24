"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  AdmissionFaculty,
  AdmissionModality,
  CatalogOption,
  SchoolOption,
  UbigeoDepartment,
  UbigeoDistrict,
  UbigeoProvince,
  getCountries,
  getDepartments,
  getDistricts,
  getApplicantProgress,
  getFaculties,
  getModalities,
  getProvinces,
  getUbigeo,
  saveModalityData,
  searchSchools,
} from "@/lib/applicant";

type VacancyRight = "with" | "without";
type WizardStep = 1 | 2 | 3;

type ModalityGroup = {
  key: string;
  title: string;
  description: string;
  modalities: AdmissionModality[];
};

const fallbackImage =
  "/images/modality-default.svg";
const vacancyRightImage = "/images/vacancy-right.svg";
const noVacancyRightImage = "/images/no-vacancy-right.svg";

const groupDescriptions: Record<string, { title: string; description: string }> = {
  ordinary: {
    title: "Ordinario e ingreso directo",
    description:
      "Modalidades para iniciar estudios mediante examen general o por rendimiento en centros preuniversitarios UNI.",
  },
  extraordinaryStart: {
    title: "Extraordinarias para iniciar estudios",
    description:
      "Opciones con requisitos especiales para postulantes que inician una especialidad en la UNI.",
  },
  continueStudies: {
    title: "Continuar estudios",
    description:
      "Modalidades para postulantes que ya tienen estudios universitarios, grado o titulo previo.",
  },
  ien: {
    title: "Ingreso Escolar Nacional",
    description:
      "Modalidad independiente para estudiantes del ultimo anio de secundaria, segun el reglamento de admision.",
  },
  beca18: {
    title: "Talento Beca 18",
    description:
      "Modalidad independiente para postulantes vinculados a PRONABEC, con documentos propios.",
  },
  interested: {
    title: "Sin derecho a vacante",
    description:
      "Participa como interesado: rinde evaluaciones y recibe sus notas, sin acceder a una vacante.",
  },
};


const groupOrder = [
  "ordinary",
  "extraordinaryStart",
  "ien",
  "beca18",
  "interested",
  "continueStudies",
];

const modalityGroupByCode: Record<string, string> = {
  ORD: "ordinary",
  "ID-CEPRE": "ordinary",
  "ID-JUL": "ordinary",
  PP: "extraordinaryStart",
  DCAR: "extraordinaryStart",
  BI: "extraordinaryStart",
  PIR: "extraordinaryStart",
  PCD: "extraordinaryStart",
  CAB: "extraordinaryStart",
  DIP: "extraordinaryStart",
  TE: "continueStudies",
  "TE-NL": "continueStudies",
  "TG-UNI": "continueStudies",
  "TG-EXT": "continueStudies",
  IEN: "ien",
  BECA18: "beca18",
  INTERESADO: "interested",
};

export default function ModalityWizard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [vacancyRight, setVacancyRight] = useState<VacancyRight | null>(null);
  const [modalities, setModalities] = useState<AdmissionModality[]>([]);
  const [faculties, setFaculties] = useState<AdmissionFaculty[]>([]);
  const [countries, setCountries] = useState<CatalogOption[]>([]);
  const [departments, setDepartments] = useState<UbigeoDepartment[]>([]);
  const [provinces, setProvinces] = useState<UbigeoProvince[]>([]);
  const [districts, setDistricts] = useState<UbigeoDistrict[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [modalityId, setModalityId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [speciality1Id, setSpeciality1Id] = useState("");
  const [speciality2Id, setSpeciality2Id] = useState("");
  const [schoolCountryId, setSchoolCountryId] = useState("");
  const [schoolDepartmentCode, setSchoolDepartmentCode] = useState("");
  const [schoolProvinceCode, setSchoolProvinceCode] = useState("");
  const [schoolDistrictId, setSchoolDistrictId] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [foreignSchoolName, setForeignSchoolName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalitiesLoading, setIsModalitiesLoading] = useState(false);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedFaculty = useMemo(
    () => faculties.find((faculty) => String(faculty.id) === facultyId) ?? null,
    [faculties, facultyId]
  );

  const selectedModality = useMemo(
    () => modalities.find((modality) => String(modality.id) === modalityId) ?? null,
    [modalities, modalityId]
  );

  const secondSpecialityOptions = useMemo(
    () => selectedFaculty?.majors.filter((major) => String(major.id) !== speciality1Id) ?? [],
    [selectedFaculty, speciality1Id]
  );

  const modalityGroups = useMemo(() => groupModalities(modalities), [modalities]);

  const selectedSchoolCountry = useMemo(
    () => countries.find((country) => String(country.id) === schoolCountryId) ?? null,
    [countries, schoolCountryId]
  );

  const schoolCountryIsPeru = useMemo(
    () => selectedSchoolCountry
      ? selectedSchoolCountry.code === "PE" ||
        ["PERU", "PERÚ"].includes(selectedSchoolCountry.name.toUpperCase())
      : false,
    [selectedSchoolCountry]
  );

  const canSubmitAcademicData =
    !!facultyId &&
    !!speciality1Id &&
    !!schoolCountryId &&
    (schoolCountryIsPeru ? !!schoolDistrictId && !!schoolId : !!foreignSchoolName.trim());

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    Promise.all([getFaculties(), getCountries(storedToken), getDepartments(), getApplicantProgress(storedToken)])
      .then(async ([facultyResponse, countryResponse, departmentResponse, progressResponse]) => {
        setFaculties(facultyResponse.faculties);
        setCountries(countryResponse.data);
        setDepartments(departmentResponse.data);

        const applicant = progressResponse.applicant;
        const peruCountry = countryResponse.data.find(
          (country) =>
            country.code === "PE" || ["PERU", "PERÚ"].includes(country.name.toUpperCase())
        );

        if (typeof applicant?.has_vacancy_right === "boolean") {
          setVacancyRight(applicant.has_vacancy_right ? "with" : "without");
          setCurrentStep(applicant.modality?.id ? 3 : 2);
        }

        if (applicant?.modality?.id) {
          setModalityId(String(applicant.modality.id));
        }

        if (applicant?.faculty?.id) {
          setFacultyId(String(applicant.faculty.id));
        }

        if (applicant?.speciality1?.id) {
          setSpeciality1Id(String(applicant.speciality1.id));
        }

        if (applicant?.speciality2?.id) {
          setSpeciality2Id(String(applicant.speciality2.id));
        }

        if (applicant?.school) {
          setSchoolId(String(applicant.school.id));
          setSchoolQuery(applicant.school.name);
          setForeignSchoolName(applicant.school.name);
          setSchoolCountryId(String(applicant.school.country_id ?? peruCountry?.id ?? ""));

          if (applicant.school.ubigeo_id) {
            setSchoolDistrictId(String(applicant.school.ubigeo_id));
            try {
              const ubigeoResponse = await getUbigeo(applicant.school.ubigeo_id);
              const code = ubigeoResponse.data.code;
              setSchoolDepartmentCode(`${code.slice(0, 2)}0000`);
              setSchoolProvinceCode(`${code.slice(0, 4)}00`);
            } catch {
              // Si no se puede reconstruir el ubigeo, el usuario puede volver a escogerlo.
            }
          }
        } else if (peruCountry) {
          setSchoolCountryId(String(peruCountry.id));
        }
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar facultades y modalidades."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  useEffect(() => {
    if (!schoolDepartmentCode) {
      setProvinces([]);
      return;
    }

    getProvinces(schoolDepartmentCode)
      .then((response) => setProvinces(response.data))
      .catch(() => setProvinces([]));
  }, [schoolDepartmentCode]);

  useEffect(() => {
    if (!schoolProvinceCode) {
      setDistricts([]);
      return;
    }

    getDistricts(schoolProvinceCode)
      .then((response) => setDistricts(response.data))
      .catch(() => setDistricts([]));
  }, [schoolProvinceCode]);

  useEffect(() => {
    if (!schoolCountryIsPeru || !schoolDistrictId || schoolQuery.trim().length < 2) {
      setSchoolOptions([]);
      return;
    }

    setIsSchoolsLoading(true);
    searchSchools(Number(schoolDistrictId), schoolQuery.trim())
      .then((response) => setSchoolOptions(response.schools))
      .catch(() => setSchoolOptions([]))
      .finally(() => setIsSchoolsLoading(false));
  }, [schoolCountryIsPeru, schoolDistrictId, schoolQuery]);

  useEffect(() => {
    if (!vacancyRight) {
      setModalities([]);
      return;
    }

    setIsModalitiesLoading(true);
    getModalities(vacancyRight === "with")
      .then((response) => {
        setModalities(response.modalities);
        setModalityId((current) =>
          response.modalities.some((modality) => String(modality.id) === current) ? current : ""
        );
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar las modalidades."
        );
      })
      .finally(() => setIsModalitiesLoading(false));
  }, [vacancyRight]);

  const chooseVacancyRight = (value: VacancyRight) => {
    setVacancyRight(value);
    setCurrentStep(1);
    setModalityId("");
    setFacultyId("");
    setSpeciality1Id("");
    setSpeciality2Id("");
    resetSchoolSelection(false);
    setError(null);
    setMessage(null);
  };

  const chooseModality = (id: number) => {
    setModalityId(String(id));
    setFacultyId("");
    setSpeciality1Id("");
    setSpeciality2Id("");
    resetSchoolSelection(false);
    setError(null);
    setMessage(null);
  };

  const chooseModalityAndContinue = (id: number) => {
    chooseModality(id);
    setCurrentStep(3);
  };

  const handleFacultyChange = (value: string) => {
    setFacultyId(value);
    setSpeciality1Id("");
    setSpeciality2Id("");
  };

  const resetSchoolSelection = (keepCountry: boolean) => {
    setSchoolDepartmentCode("");
    setSchoolProvinceCode("");
    setSchoolDistrictId("");
    setSchoolQuery("");
    setSchoolId("");
    setForeignSchoolName("");
    setSchoolOptions([]);
    if (!keepCountry) {
      setSchoolCountryId((current) => current);
    }
  };

  const handleSchoolCountryChange = (value: string) => {
    setSchoolCountryId(value);
    resetSchoolSelection(true);
  };

  const handleSchoolDepartmentChange = (value: string) => {
    setSchoolDepartmentCode(value);
    setSchoolProvinceCode("");
    setSchoolDistrictId("");
    setSchoolQuery("");
    setSchoolId("");
    setSchoolOptions([]);
  };

  const handleSchoolProvinceChange = (value: string) => {
    setSchoolProvinceCode(value);
    setSchoolDistrictId("");
    setSchoolQuery("");
    setSchoolId("");
    setSchoolOptions([]);
  };

  const handleSchoolDistrictChange = (value: string) => {
    setSchoolDistrictId(value);
    setSchoolQuery("");
    setSchoolId("");
    setSchoolOptions([]);
  };

  const continueFromVacancy = () => {
    if (!vacancyRight) {
      setError("Seleccione si el postulante tiene derecho a vacante.");
      return;
    }

    setError(null);
    setCurrentStep(2);
  };

  const continueFromModality = () => {
    if (!modalityId) {
      setError("Seleccione una modalidad para continuar.");
      return;
    }

    setError(null);
    setCurrentStep(3);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !vacancyRight) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await saveModalityData(token, {
        has_vacancy_right: vacancyRight === "with",
        modality_id: Number(modalityId),
        faculty_id: Number(facultyId),
        speciality1_id: Number(speciality1Id),
        speciality2_id: speciality2Id ? Number(speciality2Id) : null,
        school_country_id: Number(schoolCountryId),
        school_ubigeo_id: schoolCountryIsPeru ? Number(schoolDistrictId) : null,
        school_id: schoolCountryIsPeru ? Number(schoolId) : null,
        school_name: schoolCountryIsPeru ? null : foreignSchoolName.trim(),
      });

      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Modalidad, facultad, carrera y colegio guardados correctamente.");
      router.push("/documents");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo guardar la modalidad."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando modalidades...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-8 md:px-6">
      <PageHeader currentStep={currentStep} />

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

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <VacancyCard
              title="Con derecho a vacante"
              description="Postula para competir por una plaza de ingreso a una especialidad UNI, segun modalidad y cuadro de vacantes."
              imageUrl={vacancyRightImage}
              selected={vacancyRight === "with"}
              onClick={() => chooseVacancyRight("with")}
            />
            <VacancyCard
              title="Sin derecho a vacante"
              description="Participa como interesado: rinde evaluaciones y recibe sus notas, pero no accede a una vacante."
              imageUrl={noVacancyRightImage}
              selected={vacancyRight === "without"}
              onClick={() => chooseVacancyRight("without")}
            />
          </div>

          <StepFooter
            backHref="/photo"
            nextLabel="Continuar"
            nextDisabled={!vacancyRight}
            onNext={continueFromVacancy}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {isModalitiesLoading ? (
            <div className="rounded-lg border border-[#9A999D]/30 bg-white p-6 text-sm font-medium text-[#711610]">
              Cargando modalidades...
            </div>
          ) : (
            <div className="space-y-6">
              {modalityGroups.map((group) => (
                <section
                  key={group.key}
                  className="rounded-lg border border-[#9A999D]/30 bg-white p-4 md:p-5"
                >
                  <div className="mb-4 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                      Grupo de modalidad
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-[#711610]">
                      {group.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#711610]">
                      {group.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.modalities.map((modality) => (
                      <ModalityCard
                        key={modality.id}
                        modality={modality}
                        selected={String(modality.id) === modalityId}
                        onClick={() => chooseModality(modality.id)}
                        onDoubleClick={() => chooseModalityAndContinue(modality.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <StepFooter
            backLabel="Regresar"
            nextLabel="Continuar"
            nextDisabled={!modalityId}
            onBack={() => setCurrentStep(1)}
            onNext={continueFromModality}
          />
        </div>
      )}

      {currentStep === 3 && !selectedModality && (
        <div className="rounded-lg border border-[#9A999D]/30 bg-white p-6 text-sm font-medium text-[#711610]">
          Cargando modalidad seleccionada...
        </div>
      )}

      {currentStep === 3 && selectedModality && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white">
            <div
              className="h-56 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${selectedModality.image_url ?? fallbackImage})`,
              }}
            />
            <div className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase text-[#711610]">
                Modalidad seleccionada
              </p>
              <h2 className="text-xl font-semibold text-[#711610]">
                {selectedModality.name}
              </h2>
              <p className="text-sm font-semibold text-[#711610]">
                {selectedModality.name_regulation}
              </p>
              <p className="text-sm leading-6 text-[#711610]">
                {selectedModality.description}
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                Facultad y especialidad
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#711610]">
                Elija la postulacion
              </h2>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Facultad</span>
              <select
                value={facultyId}
                onChange={(event) => handleFacultyChange(event.target.value)}
                className="form-input"
                required
              >
                <option value="">Seleccione facultad</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.acronym} - {faculty.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedFaculty && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Carrera 1</span>
                  <select
                    value={speciality1Id}
                    onChange={(event) => {
                      setSpeciality1Id(event.target.value);
                      if (event.target.value === speciality2Id) {
                        setSpeciality2Id("");
                      }
                    }}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccione carrera</option>
                    {selectedFaculty.majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.code} - {major.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">
                    Carrera 2 opcional
                  </span>
                  <select
                    value={speciality2Id}
                    onChange={(event) => setSpeciality2Id(event.target.value)}
                    className="form-input"
                    disabled={!speciality1Id || secondSpecialityOptions.length === 0}
                  >
                    <option value="">Sin segunda carrera</option>
                    {secondSpecialityOptions.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.code} - {major.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>

          <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                Colegio de procedencia
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#711610]">
                Donde culmino secundaria
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#711610]">
                Si el colegio está fuera del Peru, solo indique el pais y el nombre del colegio.
              </p>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Pais del colegio</span>
              <select
                value={schoolCountryId}
                onChange={(event) => handleSchoolCountryChange(event.target.value)}
                className="form-input"
                required
              >
                <option value="">Seleccione pais</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            {schoolCountryIsPeru ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#711610]">Departamento</span>
                    <select
                      value={schoolDepartmentCode}
                      onChange={(event) => handleSchoolDepartmentChange(event.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Seleccione</option>
                      {departments.map((department) => (
                        <option key={department.code} value={department.code}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#711610]">Provincia</span>
                    <select
                      value={schoolProvinceCode}
                      onChange={(event) => handleSchoolProvinceChange(event.target.value)}
                      className="form-input"
                      disabled={!schoolDepartmentCode}
                      required
                    >
                      <option value="">Seleccione</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#711610]">Distrito</span>
                    <select
                      value={schoolDistrictId}
                      onChange={(event) => handleSchoolDistrictChange(event.target.value)}
                      className="form-input"
                      disabled={!schoolProvinceCode}
                      required
                    >
                      <option value="">Seleccione</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Buscar colegio</span>
                  <input
                    value={schoolQuery}
                    onChange={(event) => {
                      setSchoolQuery(event.target.value);
                      setSchoolId("");
                    }}
                    className="form-input"
                    disabled={!schoolDistrictId}
                    placeholder="Escriba al menos 2 letras del colegio"
                    required
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Colegio</span>
                  <select
                    value={schoolId}
                    onChange={(event) => {
                      const selected = schoolOptions.find(
                        (school) => String(school.id) === event.target.value
                      );
                      setSchoolId(event.target.value);
                      if (selected) setSchoolQuery(selected.name);
                    }}
                    className="form-input"
                    disabled={!schoolDistrictId || schoolQuery.trim().length < 2 || isSchoolsLoading}
                    required
                  >
                    <option value="">
                      {isSchoolsLoading ? "Buscando colegios..." : "Seleccione colegio"}
                    </option>
                    {schoolId && !schoolOptions.some((school) => String(school.id) === schoolId) && (
                      <option value={schoolId}>{schoolQuery}</option>
                    )}
                    {schoolOptions.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#711610]">Nombre del colegio</span>
                <input
                  value={foreignSchoolName}
                  onChange={(event) => setForeignSchoolName(event.target.value)}
                  className="form-input"
                  placeholder="Colegio donde culmino secundaria"
                  required
                />
              </label>
            )}
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Regresar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmitAcademicData}
              className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
            >
              {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            </button>
          </footer>
        </form>
      )}
    </section>
  );
}

function groupModalities(modalities: AdmissionModality[]) {
  const groups = new Map<string, AdmissionModality[]>();

  modalities.forEach((modality) => {
    const key =
      modalityGroupByCode[modality.code] ??
      (modality.requires_vacancy_right
        ? modality.start_studies
          ? "extraordinaryStart"
          : "continueStudies"
        : "interested");

    groups.set(key, [...(groups.get(key) ?? []), modality]);
  });

  return groupOrder
    .map((key): ModalityGroup | null => {
      const groupModalitiesForKey = groups.get(key) ?? [];
      const metadata = groupDescriptions[key];

      if (groupModalitiesForKey.length === 0 || !metadata) {
        return null;
      }

      return {
        key,
        title: metadata.title,
        description: metadata.description,
        modalities: groupModalitiesForKey,
      };
    })
    .filter((group): group is ModalityGroup => group !== null);
}

function PageHeader({ currentStep }: { currentStep: WizardStep }) {
  const headers: Record<WizardStep, { kicker: string; title: string; copy: string }> = {
    1: {
      kicker: "Paso 1 de 3",
      title: "Derecho a vacante",
      copy: "Indique si el postulante participa para alcanzar una vacante o solo como interesado.",
    },
    2: {
      kicker: "Paso 2 de 3",
      title: "Modalidad de admision",
      copy: "Seleccione una modalidad dentro del grupo que corresponda al reglamento de admision.",
    },
    3: {
      kicker: "Paso 3 de 3",
      title: "Facultad, especialidad y colegio",
      copy: "Elija la especialidad a la que postula y registre donde culmino secundaria.",
    },
  };

  const header = headers[currentStep];

  return (
    <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
        {header.kicker}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
        {header.title}
      </h1>
      <p className="mt-2 text-sm text-[#711610]">{header.copy}</p>
    </header>
  );
}

function StepFooter({
  backHref,
  backLabel = "Regresar",
  nextLabel,
  nextDisabled,
  onBack,
  onNext,
}: {
  backHref?: string;
  backLabel?: string;
  nextLabel: string;
  nextDisabled?: boolean;
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          {backLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          {backLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
      >
        {nextLabel}
      </button>
    </footer>
  );
}

function VacancyCard({
  title,
  description,
  imageUrl,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  imageUrl: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-lg border text-left transition hover:shadow-md ${
        selected
          ? "border-[#711610] bg-[#E6D9AA]/40"
          : "border-[#9A999D]/30 bg-white hover:border-[#711610]/50"
      }`}
    >
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.52)), url(${imageUrl})`,
        }}
      />
      <div className="p-5">
        <h2 className="text-lg font-semibold text-[#711610]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#711610]">{description}</p>
      </div>
    </button>
  );
}

function ModalityCard({
  modality,
  selected,
  onClick,
  onDoubleClick,
}: {
  modality: AdmissionModality;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`overflow-hidden rounded-lg border bg-white text-left transition hover:shadow-md ${
        selected
          ? "border-[#711610] ring-2 ring-[#711610]/30"
          : "border-[#9A999D]/30 hover:border-[#711610]/50"
      }`}
    >
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55)), url(${modality.image_url ?? fallbackImage})`,
        }}
      />
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
          {modality.start_studies ? "Iniciar estudios" : "Continuar estudios"}
        </p>
        <h3 className="mt-1 text-base font-semibold text-[#711610]">
          {modality.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-[#711610]">
          {modality.description}
        </p>
      </div>
    </button>
  );
}
