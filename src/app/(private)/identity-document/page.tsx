import type { Metadata } from "next";
import PersonalDataWizard from "@/components/personal-data-wizard";

export const metadata: Metadata = {
  title: "Documento de Identidad",
  description: "Paso 3 del flujo de inscripcion",
};

export default function IdentityDocumentPage() {
  return <PersonalDataWizard initialStep={3} />;
}
