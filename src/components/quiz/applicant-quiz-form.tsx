"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  AdmissionFaculty,
  ApplicantQuizData,
  QuizCatalogOption,
  getApplicantQuiz,
  getFaculties,
  getQuizMainReasons,
  getQuizPreparationTypes,
  getQuizSocialNetworks,
  getQuizSources,
  saveApplicantQuiz,
} from "@/lib/applicant";

type QuizFormState = {
  mainReasonId: string;
  majorId: string;
  preparationTypeId: string;
  preparationMonths: string;
  familyIncome: string;
  sourceId: string;
  socialNetworkId: string;
  parentsTeacherCareer: string;
  sisfoh: string;
};

const initialForm: QuizFormState = {
  mainReasonId: "",
  majorId: "",
  preparationTypeId: "",
  preparationMonths: "",
  familyIncome: "",
  sourceId: "",
  socialNetworkId: "",
  parentsTeacherCareer: "",
  sisfoh: "",
};

export default function ApplicantQuizForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState<QuizFormState>(initialForm);
  const [mainReasons, setMainReasons] = useState<QuizCatalogOption[]>([]);
  const [preparationTypes, setPreparationTypes] = useState<QuizCatalogOption[]>([]);
  const [sources, setSources] = useState<QuizCatalogOption[]>([]);
  const [socialNetworks, setSocialNetworks] = useState<QuizCatalogOption[]>([]);
  const [faculties, setFaculties] = useState<AdmissionFaculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const majors = useMemo(
    () =>
      faculties.flatMap((faculty) =>
        faculty.majors.map((major) => ({
          ...major,
          facultyName: faculty.acronym ? `${faculty.acronym} - ${faculty.name}` : faculty.name,
        }))
      ),
    [faculties]
  );

  const selectedSource = useMemo(
    () => sources.find((source) => String(source.id) === form.sourceId) ?? null,
    [sources, form.sourceId]
  );

  const requiresSocialNetwork = selectedSource?.code === "social_networks";

  const canSubmit =
    !!form.mainReasonId &&
    !!form.majorId &&
    !!form.preparationTypeId &&
    form.preparationMonths !== "" &&
    Number(form.preparationMonths) >= 0 &&
    Number(form.familyIncome) > 0 &&
    !!form.sourceId &&
    (!requiresSocialNetwork || !!form.socialNetworkId) &&
    !!form.parentsTeacherCareer &&
    !!form.sisfoh;

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    Promise.all([
      getQuizMainReasons(),
      getQuizPreparationTypes(),
      getQuizSources(),
      getQuizSocialNetworks(),
      getFaculties(),
      getApplicantQuiz(storedToken),
    ])
      .then(([reasonResponse, preparationResponse, sourceResponse, socialResponse, facultyResponse, quizResponse]) => {
        setMainReasons(reasonResponse.data);
        setPreparationTypes(preparationResponse.data);
        setSources(sourceResponse.data);
        setSocialNetworks(socialResponse.data);
        setFaculties(facultyResponse.faculties);

        if (quizResponse.quiz) {
          setForm(quizToForm(quizResponse.quiz));
        }
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar la encuesta del postulante."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const setField = (field: keyof QuizFormState) => (value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "sourceId" ? { socialNetworkId: "" } : {}),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await saveApplicantQuiz(token, {
        mainReasonId: Number(form.mainReasonId),
        majorId: Number(form.majorId),
        preparationTypeId: Number(form.preparationTypeId),
        preparationMonths: Number(form.preparationMonths),
        familyIncome: Number(form.familyIncome),
        sourceId: Number(form.sourceId),
        socialNetworkId: requiresSocialNetwork ? Number(form.socialNetworkId) : null,
        parentsTeacherCareer: form.parentsTeacherCareer,
        sisfoh: form.sisfoh,
      });

      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Encuesta guardada correctamente.");
      router.push("/resume");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo guardar la encuesta."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando encuesta...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Encuesta del postulante
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Preferencias y preparación
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#711610]">
          Complete esta información para conocer mejor el perfil académico y el medio por el que se informó.
        </p>
      </header>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Motivación
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Decisión de postular
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Motivo principal"
              value={form.mainReasonId}
              onChange={setField("mainReasonId")}
              options={mainReasons}
            />

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Especialidad de preferencia</span>
              <select
                value={form.majorId}
                onChange={(event) => setField("majorId")(event.target.value)}
                className="form-input"
                required
              >
                <option value="">Seleccione especialidad</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.id}>
                    {major.code} - {major.name} ({major.facultyName})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Preparación
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Estudios previos
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Tipo de preparación"
              value={form.preparationTypeId}
              onChange={setField("preparationTypeId")}
              options={preparationTypes}
            />
            <NumberField
              label="Meses de preparación"
              value={form.preparationMonths}
              onChange={setField("preparationMonths")}
              min="0"
            />
            <NumberField
              label="Ingreso familiar mensual"
              value={form.familyIncome}
              onChange={setField("familyIncome")}
              min="0.01"
              step="0.01"
            />
          </div>
        </section>

        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Información y contexto
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Datos complementarios
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Medio por el que se informó"
              value={form.sourceId}
              onChange={setField("sourceId")}
              options={sources}
            />

            {requiresSocialNetwork && (
              <SelectField
                label="Red social"
                value={form.socialNetworkId}
                onChange={setField("socialNetworkId")}
                options={socialNetworks}
              />
            )}

            <SelectTextField
              label="Padres o docentes influyeron en la carrera"
              value={form.parentsTeacherCareer}
              onChange={setField("parentsTeacherCareer")}
              options={[
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
                { value: "parcial", label: "Parcialmente" },
              ]}
            />

            <SelectTextField
              label="Clasificación SISFOH"
              value={form.sisfoh}
              onChange={setField("sisfoh")}
              options={[
                { value: "pobre_extremo", label: "Pobre extremo" },
                { value: "pobre", label: "Pobre" },
                { value: "no_pobre", label: "No pobre" },
                { value: "no_sabe", label: "No sabe / no aplica" },
              ]}
            />
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/family-data"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </button>
        </footer>
      </form>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: QuizCatalogOption[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input"
        required
      >
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectTextField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input"
        required
      >
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: string;
  step?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input"
        min={min}
        step={step}
        required
      />
    </label>
  );
}

function quizToForm(quiz: ApplicantQuizData): QuizFormState {
  return {
    mainReasonId: String(quiz.mainReasonId ?? ""),
    majorId: String(quiz.majorId ?? ""),
    preparationTypeId: String(quiz.preparationTypeId ?? ""),
    preparationMonths: String(quiz.preparationMonths ?? ""),
    familyIncome: String(quiz.familyIncome ?? ""),
    sourceId: String(quiz.sourceId ?? ""),
    socialNetworkId: quiz.socialNetworkId ? String(quiz.socialNetworkId) : "",
    parentsTeacherCareer: quiz.parentsTeacherCareer ?? "",
    sisfoh: quiz.sisfoh ?? "",
  };
}
