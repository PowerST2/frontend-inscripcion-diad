import type { Metadata } from "next";
import PaymentStatus from "@/components/payments/payment-status";

export const metadata: Metadata = {
  title: "payments",
  description: "Ruta legacy, usar payment",
};

export default function PaymentsPage() {
  return <PaymentStatus />;
}
