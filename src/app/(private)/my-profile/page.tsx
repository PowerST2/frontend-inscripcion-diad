import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "my-profile",
  description: "Pagina de perfil del postulante",
};

export default function MyProfilePage() {
  return <BaseStepPage title="my-profile" prevHref="/" />;
}
