import type { Metadata } from "next";
import BaseStepPage from "@/components/base-step-page";

export const metadata: Metadata = {
  title: "login o registro",
  description: "Paso 2 del flujo de inscripcion",
};

export default function LoginRegistroPage() {
  return <BaseStepPage title="login o registro" prevHref="/" nextHref="/personal-data" />;
}
