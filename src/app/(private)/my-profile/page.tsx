import type { Metadata } from "next";
import ProfileDashboard from "@/components/profile/profile-dashboard";

export const metadata: Metadata = {
  title: "my-profile",
  description: "Pagina de perfil del postulante",
};

export default function MyProfilePage() {
  return <ProfileDashboard />;
}
