import type { Metadata } from "next";
import PaymentStatus from "@/components/payments/payment-status";

export const metadata: Metadata = {
  title: "payment",
  description: "Paso 10 del flujo de inscripcion",
};

export default function PaymentPage() {
  return <PaymentStatus />;
}
