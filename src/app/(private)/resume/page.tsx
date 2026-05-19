import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "resume",
  description: "Paso 8 del flujo de inscripcion",
};

export default function ResumePage() {
  return <BaseStepPage title="resume" prevHref="/quiz" nextHref="/sworn-affidavit" />;
}
