import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "family-data",
  description: "Paso 6 del flujo de inscripcion",
};

export default function FamilyDataPage() {
  return <BaseStepPage title="family-data" prevHref="/documents" nextHref="/quiz" />;
}
