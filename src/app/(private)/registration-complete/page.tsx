import type { Metadata } from "next";
import RegistrationComplete from "@/components/satisfaction/registration-complete";

export const metadata: Metadata = {
  title: "Inscripción culminada",
  description: "Estado final de la inscripción",
};

export default function RegistrationCompletePage() {
  return <RegistrationComplete />;
}
