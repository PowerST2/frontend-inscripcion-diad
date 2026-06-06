import type { Metadata } from "next";
import ApplicantQuizForm from "@/components/quiz/applicant-quiz-form";

export const metadata: Metadata = {
  title: "Encuesta del postulante",
  description: "Encuesta de perfil del postulante",
};

export default function QuizPage() {
  return <ApplicantQuizForm />;
}
