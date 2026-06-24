"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
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
  const canConfirm =
    accepted &&
    progress?.progress.sworn_declaration_complete &&
    progress?.progress.payments_complete;

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
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Postulante" value={[applicant?.paternal_surname, applicant?.maternal_surname, applicant?.names].filter(Boolean).join(" ")} />
          <Info label="Documento" value={applicant?.document_number} />
          <Info label="Correo" value={applicant?.email} />
          <Info label="Teléfono" value={applicant?.cellular_phone} />
          <Info label="Modalidad" value={applicant?.modality?.name} />
          <Info label="Facultad" value={applicant?.faculty?.name} />
          <Info label="Especialidad" value={applicant?.speciality1?.name} />
          <Info label="Colegio" value={applicant?.school?.name} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Status label="Declaración jurada" ok={Boolean(progress?.progress.sworn_declaration_complete)} />
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

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`rounded-md px-4 py-3 text-sm font-semibold ${ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
      {label}: {ok ? "OK" : "Pendiente"}
    </div>
  );
}
