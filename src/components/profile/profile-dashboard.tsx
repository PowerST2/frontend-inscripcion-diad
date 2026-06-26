"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { FaCamera, FaCheck, FaClock, FaDownload, FaExclamationTriangle, FaFileAlt, FaIdCard, FaLock, FaUser } from "react-icons/fa";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import { ApplicantProgress, ApplicantProspectus, getApplicantProgress, getApplicantProspectus } from "@/lib/applicant";
import { areConfirmationPrerequisitesComplete, getNextFlowStep } from "@/lib/admission-flow";
import { isSemiScholarshipActivityOpen } from "@/lib/schedule-activities";

type StepStatus = "done" | "pending" | "admin" | "rejected" | "locked";

type TimelineStep = {
  label: string;
  description: string;
  href: string;
  status: StepStatus;
  lockReason?: string;
};

const statusLabels: Record<StepStatus, string> = {
  done: "Completado",
  pending: "Pendiente",
  admin: "En evaluación",
  rejected: "Observado",
  locked: "Bloqueado",
};

export default function ProfileDashboard() {
  const router = useRouter();
  const [progress, setProgress] = useState<ApplicantProgress | null>(null);
  const [prospectus, setProspectus] = useState<ApplicantProspectus | null>(null);
  const [isSemiScholarshipOpen, setIsSemiScholarshipOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      router.replace("/login-registro");
      return;
    }

    Promise.all([
      getApplicantProgress(token),
      getApplicantProspectus(token),
      isSemiScholarshipActivityOpen(),
    ])
      .then(([progressResponse, prospectusResponse, semiScholarshipOpen]) => {
        setProgress(progressResponse);
        setProspectus(prospectusResponse.data);
        setIsSemiScholarshipOpen(semiScholarshipOpen);
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

      <ProspectusDownloadCard prospectus={prospectus} />

      {isSemiScholarshipOpen && <SemiScholarshipCard />}

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
            <TimelineCard key={step.label} step={step} stepNumber={index + 1} />
          ))}
        </div>
      </section>
    </section>
  );
}

function SemiScholarshipCard() {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#E6D9AA] bg-[#fffdf8] shadow-sm">
      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#711610]">
            Semibecas abiertas
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#711610]">
            Puedes solicitar una semibeca
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#711610]/75">
            Si necesitas apoyo económico, inicia tu solicitud y sube la documentación requerida para evaluación social.
          </p>
        </div>
        <Link
          href="/semi-scholarship"
          className="inline-flex justify-center rounded-full bg-[#711610] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5e120d]"
        >
          Solicitar semibeca
        </Link>
      </div>
    </section>
  );
}

function ProspectusDownloadCard({ prospectus }: { prospectus: ApplicantProspectus | null }) {
  const isAvailable = Boolean(prospectus?.available && prospectus.document_url);
  const message = prospectus?.message ?? "Cargando disponibilidad del prospecto.";

  return (
    <section className={`rounded-lg border p-5 ${isAvailable ? "border-green-200 bg-green-50" : "border-[#9A999D]/30 bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isAvailable ? "bg-green-100 text-green-800" : "bg-[#E6D9AA]/30 text-[#711610]"}`}>
            {isAvailable ? <FaDownload /> : <FaLock />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Prospecto
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Descargar prospecto
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#711610]">
              {message}
            </p>
          </div>
        </div>

        {isAvailable ? (
          <a
            href={prospectus?.document_url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-[#711610] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5e120d]"
          >
            Descargar
          </a>
        ) : (
          <button
            type="button"
            disabled
            title={message}
            className="cursor-not-allowed rounded-md bg-[#9A999D] px-5 py-3 text-sm font-semibold text-white"
          >
            No disponible
          </button>
        )}
      </div>
    </section>
  );
}

function buildTimeline(progress: ApplicantProgress | null): TimelineStep[] {
  const state = progress?.progress ?? {};
  const applicant = progress?.applicant;
  const canConfirmData = areConfirmationPrerequisitesComplete(progress);

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
      label: "Documento de identidad",
      description: "DNI o pasaporte cargado en datos personales.",
      href: "/identity-document",
      status: state.identity_document_complete ? "done" : "pending",
    },
    {
      label: "Declaración jurada",
      description: "Aceptación formal del reglamento de admisión.",
      href: "/sworn-affidavit",
      status: swornStatus,
    },
    {
      label: "Foto",
      description: "Foto del postulante para revisión administrativa.",
      href: "/photo",
      status: photoStatus,
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
      label: "Pagos",
      description: "Generación, seguimiento y validación del pago.",
      href: "/payment",
      status: state.payments_complete ? "done" : state.payments_generated ? "pending" : "admin",
    },
    {
      label: "Confirmación",
      description: "Revisión final y confirmación de datos.",
      href: "/resume",
      status: state.data_confirmed ? "done" : canConfirmData ? "pending" : "locked",
      lockReason: canConfirmData ? undefined : "Completa los primeros 10 pasos para habilitar la confirmación.",
    },
    {
      label: "Encuesta final",
      description: "Satisfacción sobre el sistema de inscripción.",
      href: "/satisfaction",
      status: state.satisfaction_survey_complete ? "done" : state.data_confirmed ? "pending" : "locked",
      lockReason: state.data_confirmed ? undefined : "Primero confirma tus datos en el paso 11.",
    },
  ];
}

function statusClass(status: StepStatus) {
  if (status === "done") return "border-[#711610]/20 border-l-[#711610]";
  if (status === "admin") return "border-[#E6D9AA] border-l-[#C99118]";
  if (status === "rejected") return "border-red-200 border-l-red-500";
  if (status === "locked") return "border-zinc-300 border-l-zinc-500 bg-zinc-50";
  return "border-[#9A999D]/25 border-l-[#9A999D]";
}

function statusTone(status: StepStatus) {
  if (status === "done") return "bg-[#711610]/10 text-[#711610]";
  if (status === "admin") return "bg-[#E6D9AA]/45 text-[#711610]";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "locked") return "bg-zinc-200 text-zinc-700";
  return "bg-[#9A999D]/10 text-[#711610]";
}

function TimelineCard({ step, stepNumber }: { step: TimelineStep; stepNumber: number }) {
  const tone = statusTone(step.status);
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${tone}`}>
          {step.status === "done" ? <FaCheck /> : step.status === "rejected" ? <FaExclamationTriangle /> : <FaClock />}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
          {statusLabels[step.status]}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
        Paso {stepNumber}
      </p>
      <h3 className="mt-1 text-base font-semibold text-[#711610]">{step.label}</h3>
      <p className="mt-2 text-sm leading-5 text-[#711610]/75">{step.description}</p>
      {step.lockReason && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/75 px-4 text-center text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
          {step.lockReason}
        </span>
      )}
    </>
  );

  const className = `group relative rounded-3xl border border-l-4 bg-[#fffdf8] p-4 shadow-sm transition ${statusClass(step.status)}`;

  if (step.status === "locked") {
    return (
      <div title={step.lockReason} aria-disabled="true" className={`${className} cursor-not-allowed opacity-90`}>
        {content}
      </div>
    );
  }

  return (
    <Link href={step.href} className={`${className} hover:shadow-md`}>
      {content}
    </Link>
  );
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
