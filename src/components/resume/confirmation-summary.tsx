"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { areConfirmationPrerequisitesComplete } from "@/lib/admission-flow";
import { getStoredAuthToken } from "@/lib/auth";
import { ApplicantProgress, confirmApplicantData, getApplicantProgress } from "@/lib/applicant";

export default function ConfirmationSummary() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [progress, setProgress] = useState<ApplicantProgress | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);
    getApplicantProgress(storedToken)
      .then(setProgress)
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar el resumen de inscripción."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const applicant = progress?.applicant;
  const registeredFamilyMembers =
    applicant?.family_members?.filter((member) =>
      member.status !== "not_present" &&
      Boolean([member.names, member.last_names, member.dni, member.phone_primary, member.address].filter(Boolean).length)
    ) ?? [];
  const shouldShowUniversity = Boolean(applicant?.university?.name);
  const canConfirm =
    accepted &&
    areConfirmationPrerequisitesComplete(progress);

  const submit = async () => {
    if (!token || !canConfirm) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await confirmApplicantData(token);
      window.dispatchEvent(new Event("admision-progress-updated"));
      router.push("/satisfaction");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo confirmar la inscripción."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando resumen...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Confirmación
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Revise sus datos antes de confirmar
        </h1>
      </header>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <SummarySection title="Datos del postulante">
          <Info label="Postulante" value={[applicant?.paternal_surname, applicant?.maternal_surname, applicant?.names].filter(Boolean).join(" ")} />
          <Info label="Tipo de documento" value={applicant?.document_type?.name ?? applicant?.document_type?.code} />
          <Info label="Número de documento" value={applicant?.document_number} />
          <Info label="Correo" value={applicant?.email} />
          <Info
            label="Teléfonos"
            value={[
              applicant?.cellular_phone,
              applicant?.phone,
              applicant?.other_phone,
            ]
              .filter(Boolean)
              .join(' - ')}
          />
          <Info
            label="Fecha de nacimiento"
            value={
              applicant?.date_birth
                ? new Date(applicant.date_birth).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : ''
            }
          />         
          <Info label="Dirección" value={applicant?.direction} />
          {applicant?.has_disability && (
            <Info
              label="Discapacidad"
              value={applicant?.disability_description ?? "Sí"}
            />
          )}
        </SummarySection>

        <SummarySection title={shouldShowUniversity ? "Nacimiento y universidad" : "Nacimiento y colegio"}>
          <Info label="País de residencia" value={applicant?.country_residence?.name} />
          <Info label="Ubigeo de residencia" value={formatUbigeo(applicant?.ubigeo_residence)} />
          <Info label="País de nacimiento" value={applicant?.country_birth?.name} />
          <Info label="Ubigeo de nacimiento" value={formatUbigeo(applicant?.ubigeo_birth)} />
          <Info label="Inicio secundaria" value={formatValue(applicant?.start_study)} />
          <Info label="Fin secundaria" value={formatValue(applicant?.end_study)} />
          {shouldShowUniversity ? (
            <Info label="Universidad de origen" value={applicant?.university?.name} />
          ) : (
            <Info label="Colegio" value={applicant?.school?.name} />
          )}
        </SummarySection>

        <SummarySection title="Modalidad y carrera">
          <Info label="Modalidad" value={applicant?.modality?.name} />
          {applicant?.modality2?.name && (
            <Info label="Modalidad secundaria" value={applicant.modality2.name} />
          )}
          <Info label="Facultad" value={applicant?.faculty?.name} />
          <Info label="Especialidad principal" value={applicant?.speciality1?.name} />
          {applicant?.speciality2?.name && (
            <Info label="Especialidad secundaria" value={applicant.speciality2.name} />
          )}
        </SummarySection>

        {registeredFamilyMembers.length > 0 && (
          <SummarySection title="Familia">
            {registeredFamilyMembers.map((member) => (
              <Info
                key={member.id}
                label={familyLabel(member.type)}
                value={[
                  [member.last_names, member.names].filter(Boolean).join(" "),
                  member.dni ? `DNI: ${member.dni}` : null,
                  member.phone_primary ? `Tel: ${member.phone_primary}` : null,
                ].filter(Boolean).join(" · ")}
              />
            ))}
          </SummarySection>
          
        )}
        <VacancyRightSection hasVacancyRight={Boolean(applicant?.has_vacancy_right)} />

        <div className="grid gap-3 md:grid-cols-3">
          <Status label="Declaración inicial" ok={Boolean(progress?.progress.initial_consent_complete)} />
          <Status label="Datos personales" ok={Boolean(progress?.progress.identity_complete)} />
          <Status label="Documento de identidad" ok={Boolean(progress?.progress.identity_document_complete)} />
          <Status label="Declaración jurada" ok={Boolean(progress?.progress.sworn_declaration_complete)} />
          <Status label="Foto" ok={Boolean(progress?.progress.photo_complete)} />
          <Status label="Modalidad" ok={Boolean(progress?.progress.modality_complete)} />
          <Status label="Documentos" ok={Boolean(progress?.progress.documents_complete)} />
          <Status label="Familia" ok={Boolean(progress?.progress.family_complete)} />
          <Status label="Encuesta" ok={Boolean(progress?.progress.quiz_complete)} />
          <Status label="Pago validado" ok={Boolean(progress?.progress.payments_complete)} />
          <Status label="Datos confirmados" ok={Boolean(progress?.progress.data_confirmed)} />
        </div>

        <label className="flex items-start gap-3 rounded-md border border-[#9A999D]/30 bg-[#E6D9AA]/15 px-4 py-3 text-sm leading-6 text-[#711610]">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            disabled={progress?.progress.data_confirmed}
            className="mt-1"
          />
          <span>
            Confirmo que he revisado todos los datos de mi postulación y que son correctos. Entiendo que, al confirmar, ya no podré modificarlos desde el portal.
          </span>
        </label>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/payment"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting || !canConfirm || progress?.progress.data_confirmed}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            {progress?.progress.data_confirmed ? "Datos confirmados" : isSubmitting ? "Confirmando..." : "Confirmar datos"}
          </button>
        </footer>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-[#9A999D]/25 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">{label}</p>
      <p className="mt-1 font-semibold text-[#711610]">{value || "Pendiente"}</p>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[#711610]">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function VacancyRightSection({ hasVacancyRight }: { hasVacancyRight: boolean }) {
  return (
    <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 text-[#711610]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Derecho a vacante
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            {hasVacancyRight ? "Declara que sí tiene derecho a vacante" : "Declara que no tiene derecho a vacante"}
          </h2>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${
            hasVacancyRight ? "bg-green-100 text-green-800" : "bg-[#E6D9AA] text-[#711610]"
          }`}
        >
          {hasVacancyRight ? "Con derecho declarado" : "Sin derecho declarado"}
        </span>
      </div>

      {hasVacancyRight && (
        <div className="mt-4 rounded-md border border-amber-300 bg-white px-4 py-3 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Advertencia importante</p>
          <p className="mt-1">
            El derecho a vacante está sujeto al cumplimiento de todos los requisitos exigidos
            por el reglamento y por la modalidad de postulación. Si durante la validación de
            datos o la verificación documentaria correspondiente, incluida la revisión ante
            DIRCE-UNI cuando aplique, se detecta que el postulante no cumple dichos requisitos
            o presentó información no verídica, la inscripción, ficha o asignación de vacante
            podrá ser anulada, incluso si ya se hubiera asignado una vacante o emitido una
            constancia de ingreso, sin derecho a reclamo ni reembolso de pagos.
          </p>
        </div>
      )}
    </section>
  );
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function formatUbigeo(
  ubigeo?: { department?: string | null; province?: string | null; district?: string | null } | null
) {
  const value = [ubigeo?.department, ubigeo?.province, ubigeo?.district]
    .filter(Boolean)
    .join(" / ");

  return value || null;
}

function familyLabel(type: string) {
  if (type === "father") return "Padre";
  if (type === "mother") return "Madre";
  if (type === "guardian") return "Apoderado";
  return type;
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`rounded-md px-4 py-3 text-sm font-semibold ${ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
      {label}: {ok ? "OK" : "Pendiente"}
    </div>
  );
}
