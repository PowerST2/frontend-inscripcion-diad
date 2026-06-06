import type { Metadata } from "next";
import ConfirmationSummary from "@/components/resume/confirmation-summary";

export const metadata: Metadata = {
  title: "resume",
  description: "Paso 8 del flujo de inscripcion",
};

export default function ResumePage() {
  return <ConfirmationSummary />;
}
