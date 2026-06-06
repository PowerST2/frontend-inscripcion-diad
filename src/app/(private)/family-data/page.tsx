import type { Metadata } from "next";
import FamilyDataForm from "@/components/family/family-data-form";

export const metadata: Metadata = {
  title: "Datos familiares",
  description: "Registro de padre, madre y apoderado",
};

export default function FamilyDataPage() {
  return <FamilyDataForm />;
}
