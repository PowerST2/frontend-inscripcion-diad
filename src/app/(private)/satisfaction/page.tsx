import type { Metadata } from "next";
import SatisfactionSurveyForm from "@/components/satisfaction/satisfaction-survey-form";

export const metadata: Metadata = {
  title: "Encuesta final",
  description: "Encuesta de satisfacción del sistema",
};

export default function SatisfactionPage() {
  return <SatisfactionSurveyForm />;
}
