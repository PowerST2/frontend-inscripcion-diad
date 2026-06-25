"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSatisfactionSurvey } from "@/lib/applicant";
import { getStoredAuthToken } from "@/lib/auth";
import { isFichaActivityOpen } from "@/lib/schedule-activities";
import { getSystemDocumentUrl } from "@/lib/system-documents";

export default function RegistrationComplete() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFichaLoading, setIsFichaLoading] = useState(true);
  const [fichaUrl, setFichaUrl] = useState<string | null>(null);
  const [fichaMessage, setFichaMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      router.replace("/login-registro");
      return;
    }

    getSatisfactionSurvey(token)
      .then((response) => {
        if (!response.data) {
          router.replace("/satisfaction");
          return;
        }

        setIsLoading(false);
        loadFichaAvailability();
      })
      .catch(() => router.replace("/satisfaction"));
  }, [router]);

  const loadFichaAvailability = async () => {
    setIsFichaLoading(true);
    setFichaUrl(null);
    setFichaMessage(null);

    try {
      const [isFichaOpen, documentUrl] = await Promise.all([
        isFichaActivityOpen(),
        getSystemDocumentUrl("ficha"),
      ]);

      if (isFichaOpen && documentUrl) {
        setFichaUrl(documentUrl);
        setFichaMessage("Tu ficha está disponible para descargar.");
      } else {
        setFichaMessage(
          "La ficha todavía no está disponible. Comunícate con el área de informes para que te indiquen la fecha de publicación."
        );
      }
    } catch {
      setFichaMessage(
        "No se pudo verificar la disponibilidad de la ficha. Comunícate con el área de informes."
      );
    } finally {
      setIsFichaLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando estado de inscripción...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 md:px-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
          Inscripción culminada
        </p>
        <h1 className="mt-2 text-3xl font-bold">Tu inscripción ha culminado</h1>
        <p className="mt-3 text-sm leading-6">
          Gracias por completar la encuesta final. Desde esta vista podrás verificar la
          disponibilidad de tu ficha de inscripción.
        </p>

        <div className="mt-6 rounded-lg border border-green-200 bg-white p-4 text-sm leading-6">
          {isFichaLoading ? (
            <p>Verificando disponibilidad de ficha...</p>
          ) : fichaUrl ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p>{fichaMessage}</p>
              <a
                href={fichaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
              >
                Descargar ficha
              </a>
            </div>
          ) : (
            <p>{fichaMessage}</p>
          )}
        </div>

        <footer className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/my-profile"
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
          >
            Ir a mi perfil
          </Link>
          <button
            type="button"
            onClick={loadFichaAvailability}
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Verificar ficha
          </button>
        </footer>
      </div>
    </section>
  );
}
