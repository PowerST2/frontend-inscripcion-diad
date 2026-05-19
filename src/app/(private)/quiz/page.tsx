import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "quiz",
  description: "Paso 7 del flujo de inscripcion",
};

export default function QuizPage() {
  return <BaseStepPage title="quiz" prevHref="/family-data" nextHref="/resume" />;
}
