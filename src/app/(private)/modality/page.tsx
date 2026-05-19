import type { Metadata } from "next";
import ModalityWizard from "@/components/modality-wizard";

export const metadata: Metadata = {
  title: "Modalidad",
  description: "Paso 4 del flujo de inscripcion",
};

export default function ModalityPage() {
  return <ModalityWizard />;
}
