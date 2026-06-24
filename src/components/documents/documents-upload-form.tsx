"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaFileAlt, FaUpload } from "react-icons/fa";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  ApplicantUploadedDocument,
  ModalityRequiredDocument,
  getApplicantDocuments,
  getApplicantProgress,
  getModalityDocuments,
  uploadApplicantDocument,
} from "@/lib/applicant";

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(file: File) {
  const sizeKb = Math.max(1, Math.round(file.size / 1024));

  return `${sizeKb} KB`;
}

export default function DocumentsUploadForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [modalityName, setModalityName] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState<ModalityRequiredDocument[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<ApplicantUploadedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const uploadedByName = useMemo(
    () => new Map(uploadedDocuments.map((document) => [document.document_name, document])),
    [uploadedDocuments]
  );

  const completedCount = requiredDocuments.filter((document) =>
    uploadedByName.get(document.document_name)?.status !== "rejected" &&
    uploadedByName.has(document.document_name)
  ).length;

  const allDocumentsUploaded =
    requiredDocuments.length > 0 && completedCount === requiredDocuments.length;

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    getApplicantProgress(storedToken)
      .then(async (progressResponse) => {
        const modality = progressResponse.applicant?.modality;

        if (!modality?.id) {
          router.replace("/modality");
          return;
        }

        setModalityName(modality.name);

        const [requiredResponse, uploadedResponse] = await Promise.all([
          getModalityDocuments(modality.id),
          getApplicantDocuments(storedToken),
        ]);

        setRequiredDocuments(requiredResponse.data);
        setUploadedDocuments(uploadedResponse.data);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar los documentos requeridos."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleFileChange = (documentName: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFiles((current) => ({ ...current, [documentName]: file }));
    setError(null);
    setMessage(null);
  };

  const handleUpload = async (documentName: string) => {
    if (!token) return;

    const file = selectedFiles[documentName];
    if (!file) {
      setError("Seleccione un archivo antes de subirlo.");
      return;
    }

    setError(null);
    setMessage(null);
    setUploadingDocument(documentName);

    try {
      const response = await uploadApplicantDocument(token, documentName, file);
      setUploadedDocuments((current) => [
        response.document,
        ...current.filter((document) => document.document_name !== documentName),
      ]);
      setSelectedFiles((current) => ({ ...current, [documentName]: null }));
      setMessage("Documento subido correctamente.");
      window.dispatchEvent(new Event("admision-progress-updated"));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : "No se pudo subir el documento."
      );
    } finally {
      setUploadingDocument(null);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando documentos requeridos...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Paso 5 de 11
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Documentos
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#711610]">
          Cargue los documentos requeridos para la modalidad {modalityName || "seleccionada"}.
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

      <section className="mb-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
              Avance de documentos
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#711610]">
              {completedCount} de {requiredDocuments.length} cargados
            </h2>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#9A999D]/20 md:w-72">
            <div
              className="h-full rounded-full bg-[#711610] transition-all"
              style={{
                width:
                  requiredDocuments.length === 0
                    ? "0%"
                    : `${Math.round((completedCount / requiredDocuments.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {requiredDocuments.length === 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-[#711610]">
          No hay documentos activos configurados para esta modalidad.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requiredDocuments.map((document) => {
            const uploaded = uploadedByName.get(document.document_name);
            const isRejected = uploaded?.status === "rejected";
            const isPending = uploaded?.status === "pending";
            const selectedFile = selectedFiles[document.document_name] ?? null;
            const isUploading = uploadingDocument === document.document_name;

            return (
              <article
                key={document.id}
                className="rounded-lg border border-[#9A999D]/30 bg-white p-5"
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
                      uploaded && !isRejected
                        ? "bg-green-100 text-green-700"
                        : isRejected
                          ? "bg-red-100 text-red-700"
                          : "bg-[#E6D9AA]/40 text-[#711610]"
                    }`}
                  >
                    {uploaded && !isRejected ? <FaCheckCircle /> : <FaFileAlt />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                      {document.document_code}
                    </p>
                    <h2 className="mt-1 text-base font-semibold leading-6 text-[#711610]">
                      {document.document_name}
                    </h2>
                    {uploaded && !isRejected && (
                      <p className="mt-2 text-sm text-green-700">
                        {isPending ? "Pendiente de evaluación" : "Aprobado"} · cargado el{" "}
                        {formatDate(uploaded.created_at)}
                      </p>
                    )}
                    {isRejected && (
                      <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
                        Rechazado: {uploaded.rejection_reason ?? "Sin motivo registrado."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => handleFileChange(document.document_name, event)}
                    className="form-input text-sm"
                  />

                  {selectedFile && (
                    <p className="text-sm text-[#711610]">
                      {selectedFile.name} · {formatFileSize(selectedFile)}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleUpload(document.document_name)}
                    disabled={!selectedFile || isUploading}
                    className="inline-flex items-center gap-2 rounded-md bg-[#711610] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
                  >
                    <FaUpload className="text-xs" />
                    {isUploading ? "Subiendo..." : uploaded ? "Reemplazar" : "Subir documento"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="mt-6 flex items-center justify-between gap-3">
        <Link
          href="/modality"
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          Regresar
        </Link>

        {allDocumentsUploaded ? (
          <Link
            href="/family-data"
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
          >
            Siguiente
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md bg-[#9A999D] px-5 py-2 text-sm font-medium text-white"
          >
            Siguiente
          </button>
        )}
      </footer>
    </section>
  );
}
