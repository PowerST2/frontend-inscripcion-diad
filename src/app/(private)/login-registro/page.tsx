import type { Metadata } from "next";
import LoginRegisterForm from "@/components/auth/login-register-form";

export const metadata: Metadata = {
  title: "Login o registro",
  description: "Acceso al portal de inscripcion",
};

export default function LoginRegistroPage() {
  return <LoginRegisterForm />;
}
