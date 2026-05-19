"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type UploadedDocument = {
  id: string;
  documentType: string;
  fileName: string;
  fileSizeKb: number;
  addedAt: string;
};

const DOCUMENT_TYPE_OPTIONS = [
  "DNI",
  "Foto",
  "Certificado de estudios",
  "Constancia de egresado",
  "Otro",
];

function formatDate(value: Date) {
  return value.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DocumentsUploadForm() {
  const [documentType, setDocumentType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addDocuments = () => {
    if (!documentType || selectedFiles.length === 0) return;

    const now = new Date();
    const newRows: UploadedDocument[] = selectedFiles.map((file, index) => ({
      id: `${now.getTime()}-${index}-${file.name}`,
      documentType,
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      addedAt: formatDate(now),
    }));

    setDocuments((prev) => [...prev, ...newRows]);
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  const canAdd = documentType !== "" && selectedFiles.length > 0;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso 5 de 11</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">Documentos</h1>
        <p className="mt-2 text-sm text-[#711610]">
          Cargue uno o varios archivos de manera simple. Esta version es de prueba y luego sera dinamica.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#711610]">Tipo de documento</span>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
            >
              <option value="">Seleccione un tipo</option>
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#711610]">Archivos</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
              className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-sm outline-none focus:border-[#711610]"
            />
          </label>

          <button
            type="button"
            onClick={addDocuments}
            disabled={!canAdd}
            className="self-end rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white enabled:hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            Agregar
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <p className="text-sm text-[#711610]">
            {selectedFiles.length} archivo(s) listos para agregar con tipo <strong>{documentType || "(sin tipo)"}</strong>.
          </p>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#E6D9AA]/30 text-left text-[#711610]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Archivo</th>
              <th className="px-4 py-3 font-semibold">Tamano (KB)</th>
              <th className="px-4 py-3 font-semibold">Agregado</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#9A999D]">
                  Aun no se agregaron documentos.
                </td>
              </tr>
            ) : (
              documents.map((item) => (
                <tr key={item.id} className="border-t border-[#9A999D]/20 text-[#711610]">
                  <td className="px-4 py-3">{item.documentType}</td>
                  <td className="px-4 py-3">{item.fileName}</td>
                  <td className="px-4 py-3">{item.fileSizeKb}</td>
                  <td className="px-4 py-3">{item.addedAt}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeDocument(item.id)}
                      className="rounded-md border border-[#9A999D] px-3 py-1 text-xs text-[#9A999D] hover:bg-[#9A999D]/10"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3">
        <Link
          href="/modality"
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          Regresar
        </Link>

        {documents.length > 0 ? (
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
