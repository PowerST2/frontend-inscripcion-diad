import type { Metadata } from "next";
import PersonalDataWizard from "@/components/personal-data-wizard";

export const metadata: Metadata = {
  title: "Foto del Postulante",
  description: "Paso 5 del flujo de inscripcion",
};

export default function PhotoPage() {
  return <PersonalDataWizard initialStep={2} />;
}
