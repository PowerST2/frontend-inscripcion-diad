import type { Metadata } from "next";
import PreinscriptionConsent from "@/components/consent/preinscription-consent";

export const metadata: Metadata = {
  title: "Declaración inicial",
  description: "Declaración inicial de veracidad de datos",
};

export default function PreInscriptionAffidavitPage() {
  return <PreinscriptionConsent />;
}
