import type { Metadata } from "next";
import DocumentsUploadForm from "@/components/documents/documents-upload-form";

export const metadata: Metadata = {
  title: "Documentos",
  description: "Paso 5 del flujo de inscripcion",
};

export default function DocumentsPage() {
  return <DocumentsUploadForm />;
}
