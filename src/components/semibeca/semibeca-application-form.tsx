"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaFileAlt, FaUpload } from "react-icons/fa";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  SemibecaDocumentRequirement,
  SemibecaUploadedDocument,
  getSemibecaDocuments,
  uploadSemibecaDocument,
} from "@/lib/applicant";

function statusLabel(status?: string) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Observado";
  if (status === "pending") return "En revisión";
  return "Pendiente";
}

function statusClasses(status?: string) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-[#9A999D]/30 bg-white text-[#711610]";
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "approved") return <FaCheckCircle />;
  if (status === "rejected") return <FaExclamationTriangle />;
  return <FaClock />;
}

export default function SemibecaApplicationForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"regular" | "sisfoh" | null>(null);
  const [requirements, setRequirements] = useState<SemibecaDocumentRequirement[]>([]);
  const [documents, setDocuments] = useState<SemibecaUploadedDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const documentsByName = useMemo(
    () => new Map(documents.map((document) => [document.document_name, document])),
    [documents]
  );

  const uploadedCount = requirements.filter((requirement) =>
    documentsByName.has(requirement.document_name)
  ).length;

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    if (!mode) {
      setRequirements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getSemibecaDocuments(storedToken, mode)
      .then((response) => {
        setRequirements(response.requirements);
        setDocuments(response.documents);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar los requisitos de semibeca."
        );
      })
      .finally(() => setIsLoading(false));
  }, [mode, router]);

  const handleFileChange = (documentName: string, event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles((current) => ({
      ...current,
      [documentName]: event.target.files?.[0] ?? null,
    }));
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

    setUploadingDocument(documentName);
    setError(null);
    setMessage(null);

    try {
      const response = await uploadSemibecaDocument(token, documentName, file);
      setDocuments((current) => [
        response.document,
        ...current.filter((document) => document.document_name !== documentName),
      ]);
      setSelectedFiles((current) => ({ ...current, [documentName]: null }));
      setMessage("Documento de semibeca subido correctamente.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo subir el documento de semibeca."
      );
    } finally {
      setUploadingDocument(null);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando solicitud de semibeca...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-3xl border border-[#E6D9AA] bg-white p-6 text-[#711610] shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]">
          Solicitud de semibeca
        </p>
        <h1 className="mt-3 text-3xl font-bold">Documentos para evaluación social</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#711610]/80">
          Sube los documentos solicitados para que la asistenta social pueda revisarlos.
          Los archivos pueden ser PDF, JPG o PNG, con un peso máximo de 5 MB.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setMode("regular");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              mode === "regular"
                ? "border-[#711610] bg-[#711610] text-white"
                : "border-[#711610]/30 bg-white text-[#711610] hover:border-[#711610]"
            }`}
          >
            No tengo SISFOH de pobre o pobre extremo
            <span className="mt-1 block text-xs font-normal opacity-80">
              Deberás subir los 5 documentos socioeconómicos.
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sisfoh");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              mode === "sisfoh"
                ? "border-[#711610] bg-[#711610] text-white"
                : "border-[#711610]/30 bg-white text-[#711610] hover:border-[#711610]"
            }`}
          >
            Tengo SISFOH de pobre o pobre extremo
            <span className="mt-1 block text-xs font-normal opacity-80">
              Solo deberás subir tu constancia SISFOH vigente.
            </span>
          </button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#711610] px-4 py-2 text-sm font-semibold text-white">
            {uploadedCount} de {requirements.length} documentos cargados
          </span>
          <a
            href="https://focalizacion.sisfoh.gob.pe/ConsultaCSE/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#711610] px-4 py-2 text-sm font-semibold text-[#711610] transition hover:bg-[#711610] hover:text-white"
          >
            Consultar SISFOH
          </a>
          <Link
            href="/my-profile"
            className="rounded-full border border-[#711610] px-4 py-2 text-sm font-semibold text-[#711610] transition hover:bg-[#711610] hover:text-white"
          >
            Volver a mi perfil
          </Link>
        </div>
      </header>

      {(error || message) && (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {!mode && (
        <section className="rounded-2xl border border-[#E6D9AA] bg-white p-6 text-center text-[#711610] shadow-sm">
          <p className="text-lg font-bold">Seleccione una opción para continuar</p>
          <p className="mt-2 text-sm text-[#711610]/75">
            Los documentos requeridos aparecerán según tenga o no tenga clasificación SISFOH.
          </p>
        </section>
      )}

      {mode === "regular" && (
        <section className="mb-5 rounded-2xl border border-[#E6D9AA] bg-[#E6D9AA]/20 p-5 text-sm leading-6 text-[#711610]">
          <p className="font-semibold">Importante</p>
          <p>
            Si el padre, madre o apoderado no genera recibo por honorarios o boleta de pago,
            debe llenar la Declaración Jurada Simple de Ingresos y subirla en el documento de ingresos.
          </p>
        </section>
      )}

      {mode && <div className="space-y-4">
        {requirements.map((requirement) => {
          const uploaded = documentsByName.get(requirement.document_name);
          const selectedFile = selectedFiles[requirement.document_name] ?? null;
          const isUploading = uploadingDocument === requirement.document_name;

          return (
            <article
              key={requirement.id}
              className="rounded-2xl border border-[#9A999D]/25 bg-white p-5 shadow-sm"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                    Requisito {requirement.id}
                  </p>
                  <div className="mt-3 flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6D9AA]/40 text-[#711610]">
                      <FaFileAlt />
                    </div>
                    <h2 className="text-base font-semibold leading-6 text-[#711610]">
                      {requirement.document_name}
                    </h2>
                  </div>

                  <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-[#9A999D]/60 bg-[#E6D9AA]/10 px-4 py-5 text-center text-sm text-[#711610] transition hover:border-[#711610] hover:bg-[#E6D9AA]/25">
                    <FaUpload className="mx-auto mb-2 h-5 w-5" />
                    <span className="block font-semibold">
                      {selectedFile ? selectedFile.name : "Elegir archivo"}
                    </span>
                    <span className="mt-1 block text-xs text-[#9A999D]">
                      Formatos permitidos: JPG, JPEG, PNG o PDF.
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(event) => handleFileChange(requirement.document_name, event)}
                      className="sr-only"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleUpload(requirement.document_name)}
                    disabled={isUploading || !selectedFile}
                    className="mt-4 rounded-xl bg-[#711610] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8a1c14] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
                  >
                    {isUploading ? "Subiendo..." : uploaded ? "Reemplazar documento" : "Subir documento"}
                  </button>
                </div>

                <div className={`rounded-2xl border p-4 ${statusClasses(uploaded?.status)}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <StatusIcon status={uploaded?.status} />
                    {statusLabel(uploaded?.status)}
                  </div>
                  {uploaded ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <a
                        href={uploaded.document_url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline"
                      >
                        Ver archivo enviado
                      </a>
                      {uploaded.rejection_reason && (
                        <p>
                          <span className="font-semibold">Observación:</span>{" "}
                          {uploaded.rejection_reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm">Aún no se ha cargado este documento.</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>}
    </section>
  );
}
