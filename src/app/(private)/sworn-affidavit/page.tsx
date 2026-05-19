import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "sworn-affidavit",
  description: "Paso 9 del flujo de inscripcion",
};

export default function SwornAffidavitPage() {
  return <BaseStepPage title="sworn-affidavit" prevHref="/resume" nextHref="/payment" />;
}
