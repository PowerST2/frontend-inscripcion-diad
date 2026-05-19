import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "payments",
  description: "Ruta legacy, usar payment",
};

export default function PaymentsPage() {
  return <BaseStepPage title="payments" prevHref="/sworn-affidavit" nextHref="/registration-form" />;
}
