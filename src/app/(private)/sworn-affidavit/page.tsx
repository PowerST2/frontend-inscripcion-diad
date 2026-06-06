import type { Metadata } from "next";
import SwornDeclarationForm from "@/components/sworn/sworn-declaration-form";

export const metadata: Metadata = {
  title: "Declaración jurada",
  description: "Aceptación del reglamento de admisión",
};

export default function SwornAffidavitPage() {
  return <SwornDeclarationForm />;
}
