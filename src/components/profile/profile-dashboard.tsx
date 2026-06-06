"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { FaCamera, FaCheck, FaClock, FaExclamationTriangle, FaFileAlt, FaIdCard, FaUser } from "react-icons/fa";
import { ApiError } from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { ApplicantProgress, getApplicantProgress } from "@/lib/applicant";
import { getNextFlowStep } from "@/lib/admission-flow";

type StepStatus = "done" | "pending" | "admin" | "rejected";

type TimelineStep = {
  label: string;
  description: string;
  href: string;
  status: StepStatus;
};

const statusLabels: Record<StepStatus, string> = {
  done: "Completado",
  pending: "Pendiente",
  admin: "En evaluación",
  rejected: "Observado",
};

export default function ProfileDashboard() {
  const router = useRouter();
  const [progress, setProgress] = useState<ApplicantProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.replace("/login-registro");
      return;
    }

    getApplicantProgress(token)
      .then((response) => {
        setProgress(response);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar el perfil del postulante."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const steps = useMemo(() => buildTimeline(progress), [progress]);
  const completedSteps = steps.filter((step) => step.status === "done").length;
  const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const applicant = progress?.applicant;
  const nextStep = getNextFlowStep(progress);

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando perfil...
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-6">
      <header className="rounded-lg border border-[#711610]/20 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
              Mi perfil
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
              Estado de inscripción
            </h1>
          </div>
          <Link
            href={nextStep.href}
            className="rounded-md bg-[#711610] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5e120d]"
          >
            {progress?.progress.initial_consent_complete ? "Continuar pre-inscripción" : "Comenzar pre-inscripción"}
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="h-32 w-28 overflow-hidden rounded-lg border border-[#9A999D]/30 bg-[#E6D9AA]/25">
              {applicant?.photo_url ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${applicant.photo_url})` }}
                  aria-label="Foto del postulante"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#711610]">
                  <FaCamera className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-[#711610]">
                {[
                  applicant?.paternal_surname,
                  applicant?.maternal_surname,
                  applicant?.names,
                ]
                  .filter(Boolean)
                  .join(" ") || "Postulante"}
              </h2>
              <p className="mt-1 text-sm text-[#9A999D]">{applicant?.email}</p>
              <div className="mt-4 grid gap-3 text-sm">
                <InfoRow icon={<FaIdCard />} label="Documento" value={applicant?.document_number} />
                <InfoRow icon={<FaUser />} label="Modalidad" value={applicant?.modality?.name} />
                <InfoRow icon={<FaFileAlt />} label="Especialidad" value={applicant?.speciality1?.name} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                Progreso general
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#711610]">
                {progressPercent}%
              </h2>
            </div>
            <div className="rounded-md bg-[#E6D9AA]/30 px-4 py-2 text-sm font-semibold text-[#711610]">
              {completedSteps} de {steps.length} pasos
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#9A999D]/20">
            <div
              className="h-full rounded-full bg-[#711610] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatCard label="Por hacer" value={steps.filter((step) => step.status === "pending").length} />
            <StatCard label="En evaluación" value={steps.filter((step) => step.status === "admin").length} />
            <StatCard label="Observados" value={steps.filter((step) => step.status === "rejected").length} />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
            Línea de tiempo
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#711610]">
            Pasos de la inscripción
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Link
              key={step.label}
              href={step.href}
              className={`relative rounded-lg border p-4 transition hover:shadow-md ${statusClass(step.status)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">
                  {step.status === "done" ? <FaCheck /> : step.status === "rejected" ? <FaExclamationTriangle /> : <FaClock />}
                </div>
                <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold">
                  {statusLabels[step.status]}
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide opacity-70">
                Paso {index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold">{step.label}</h3>
              <p className="mt-2 text-sm leading-5 opacity-80">{step.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function buildTimeline(progress: ApplicantProgress | null): TimelineStep[] {
  const state = progress?.progress ?? {};
  const applicant = progress?.applicant;

  const photoStatus: StepStatus =
    applicant?.photo_status === "rejected"
      ? "rejected"
      : applicant?.photo_status === "pending"
        ? "admin"
        : state.photo_complete
          ? "done"
          : "pending";

  const documentStatus: StepStatus =
    (applicant?.documents_review?.rejected_count ?? 0) > 0
      ? "rejected"
      : (applicant?.documents_review?.pending_count ?? 0) > 0
        ? "admin"
        : state.documents_complete
          ? "done"
          : "pending";

  const swornStatus: StepStatus =
    applicant?.sworn_declaration?.status === "rejected"
      ? "rejected"
      : applicant?.sworn_declaration?.status === "pending"
        ? "admin"
        : state.sworn_declaration_complete
          ? "done"
          : "pending";

  return [
    {
      label: "Declaración inicial",
      description: "Conformidad sobre veracidad de datos y documentos.",
      href: "/pre-inscription-affidavit",
      status: state.initial_consent_complete ? "done" : "pending",
    },
    {
      label: "Datos personales",
      description: "Identidad, contacto, residencia, nacimiento y secundaria.",
      href: "/personal-data",
      status: state.identity_complete ? "done" : "pending",
    },
    {
      label: "Foto",
      description: "Foto del postulante para revisión administrativa.",
      href: "/personal-data",
      status: photoStatus,
    },
    {
      label: "Documento de identidad",
      description: "DNI o pasaporte cargado en datos personales.",
      href: "/personal-data",
      status: state.identity_document_complete ? "done" : "pending",
    },
    {
      label: "Modalidad y carrera",
      description: "Derecho a vacante, modalidad, facultad, especialidad y colegio.",
      href: "/modality",
      status: state.modality_complete ? "done" : "pending",
    },
    {
      label: "Documentos",
      description: "Documentos obligatorios de la modalidad seleccionada.",
      href: "/documents",
      status: documentStatus,
    },
    {
      label: "Familia",
      description: "Padre, madre y apoderado, cuando corresponda.",
      href: "/family-data",
      status: state.family_complete ? "done" : "pending",
    },
    {
      label: "Encuesta",
      description: "Información de preferencias y preparación del postulante.",
      href: "/quiz",
      status: state.quiz_complete ? "done" : "pending",
    },
    {
      label: "Declaración jurada",
      description: "Aceptación formal del reglamento de admisión.",
      href: "/sworn-affidavit",
      status: swornStatus,
    },
    {
      label: "Pagos",
      description: "Generación, seguimiento y validación del pago.",
      href: "/payment",
      status: state.payments_complete ? "done" : state.payments_generated ? "pending" : "admin",
    },
    {
      label: "Confirmación",
      description: "Revisión final y confirmación de datos.",
      href: "/resume",
      status: state.data_confirmed ? "done" : "pending",
    },
    {
      label: "Encuesta final",
      description: "Satisfacción sobre el sistema de inscripción.",
      href: "/satisfaction",
      status: state.satisfaction_survey_complete ? "done" : "pending",
    },
  ];
}

function statusClass(status: StepStatus) {
  if (status === "done") return "border-green-200 bg-green-50 text-green-800";
  if (status === "admin") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  return "border-[#9A999D]/30 bg-white text-[#711610]";
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-[#E6D9AA]/20 px-3 py-2">
      <span className="text-[#711610]">{icon}</span>
      <div>
        <p className="text-xs text-[#9A999D]">{label}</p>
        <p className="font-medium text-[#711610]">{value || "Pendiente"}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#9A999D]/25 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#711610]">{value}</p>
    </div>
  );
}
