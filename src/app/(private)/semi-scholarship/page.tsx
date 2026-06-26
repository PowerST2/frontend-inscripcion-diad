import type { Metadata } from "next";
import SemibecaApplicationForm from "@/components/semibeca/semibeca-application-form";

export const metadata: Metadata = {
  title: "Solicitud de semibeca",
};

export default function SemiScholarshipPage() {
  return <SemibecaApplicationForm />;
}
