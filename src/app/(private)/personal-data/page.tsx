import type { Metadata } from "next";
import PersonalDataWizard from "@/components/personal-data-wizard";

export const metadata: Metadata = {
  title: "Datos Personales",
  description: "Paso 3 del flujo de inscripcion",
};

export default function PersonalDataPage() {
  return <PersonalDataWizard />;
}
