import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "payment",
  description: "Paso 10 del flujo de inscripcion",
};

export default function PaymentPage() {
  return <BaseStepPage title="payment" prevHref="/sworn-affidavit" nextHref="/registration-form" />;
}
