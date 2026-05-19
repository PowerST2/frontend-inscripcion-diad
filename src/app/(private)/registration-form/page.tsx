import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "registration-form",
  description: "Paso 11 del flujo de inscripcion",
};

export default function RegistrationFormPage() {
  return <BaseStepPage title="registration-form" prevHref="/payment" />;
}
