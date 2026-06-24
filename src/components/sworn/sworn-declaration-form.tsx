"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaDownload, FaExclamationTriangle, FaFileUpload } from "react-icons/fa";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  SwornDeclarationSubmission,
  SwornDeclarationTemplate,
  getSwornDeclaration,
  uploadSwornDeclaration,
} from "@/lib/applicant";

export default function SwornDeclarationForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [template, setTemplate] = useState<SwornDeclarationTemplate>({ type: "not_configured" });
  const [submission, setSubmission] = useState<SwornDeclarationSubmission | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    getSwornDeclaration(storedToken)
      .then((response) => {
        setTemplate(response.data.template);
        setSubmission(response.data.submission);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar la declaración jurada."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedFile) return;

    if (selectedFile.size === 0) {
      setError("El archivo seleccionado esta vacio.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await uploadSwornDeclaration(token, selectedFile);
      setSubmission(response.data);
      setSelectedFile(null);
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Declaración jurada enviada correctamente.");
      router.push("/photo");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo subir la declaración jurada."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando declaración jurada...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Declaración jurada
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Aceptación del reglamento
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#711610]">
          Revise la plantilla, firme el documento si corresponde y cargue el archivo escaneado o digitalizado.
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

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Plantilla
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Documento base
            </h2>
          </div>

          <TemplatePreview template={template} />
        </section>

        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Envío
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              Archivo firmado
            </h2>
          </div>

          <SubmissionStatus submission={submission} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block rounded-lg border border-dashed border-[#9A999D]/60 bg-[#E6D9AA]/10 px-4 py-5 text-center text-sm text-[#711610]">
              <FaFileUpload className="mx-auto mb-2 h-6 w-6" />
              <span className="block font-semibold">
                {selectedFile ? selectedFile.name : "Seleccionar declaración jurada"}
              </span>
              <span className="mt-1 block text-xs text-[#9A999D]">
                Formatos: JPG, JPEG, PNG o PDF. Máximo 5 MB.
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <footer className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/identity-document"
                className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
              >
                Regresar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
              >
                {isSubmitting ? "Subiendo..." : "Subir y continuar"}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </section>
  );
}

function TemplatePreview({ template }: { template: SwornDeclarationTemplate }) {
  if (template.type === "not_configured") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        La plantilla de declaración jurada aún no está configurada en documentos del sistema.
      </div>
    );
  }

  if (template.type === "file") {
    return template.url ? (
      <a
        href={template.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-[#711610] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
      >
        <FaDownload />
        Descargar plantilla
      </a>
    ) : (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        La plantilla está configurada como archivo, pero no tiene URL disponible.
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none rounded-md border border-[#9A999D]/30 bg-white px-4 py-3 text-[#711610]"
      dangerouslySetInnerHTML={{ __html: template.text ?? "" }}
    />
  );
}

function SubmissionStatus({ submission }: { submission: SwornDeclarationSubmission | null }) {
  if (!submission) {
    return (
      <div className="rounded-md border border-[#9A999D]/30 bg-[#E6D9AA]/15 px-4 py-3 text-sm text-[#711610]">
        Aún no ha enviado una declaración jurada.
      </div>
    );
  }

  const status = submission.status;
  const isRejected = status === "rejected";
  const isReviewed = status === "reviewed";

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        isRejected
          ? "border-red-200 bg-red-50 text-red-800"
          : isReviewed
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        {isRejected ? <FaExclamationTriangle /> : isReviewed ? <FaCheckCircle /> : <FaClock />}
        {isRejected ? "Observada" : isReviewed ? "Revisada" : "Pendiente de revisión"}
      </div>
      {submission.rejection_reason && (
        <p className="mt-2 leading-6">Motivo: {submission.rejection_reason}</p>
      )}
      {submission.document_url && (
        <a
          href={submission.document_url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 font-semibold underline"
        >
          Ver archivo enviado
        </a>
      )}
    </div>
  );
}
