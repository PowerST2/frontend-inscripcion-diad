"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import {
  PreinscriptionConsentData,
  acceptPreinscriptionConsent,
  getPreinscriptionConsent,
} from "@/lib/applicant";

export default function PreinscriptionConsent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<PreinscriptionConsentData | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    getPreinscriptionConsent(storedToken)
      .then((response) => {
        setData(response.data);
        setAccepted(response.data.accepted);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar la declaración inicial."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const submit = async () => {
    if (!token || !accepted) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await acceptPreinscriptionConsent(token);
      window.dispatchEvent(new Event("admision-progress-updated"));
      router.push("/personal-data");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo registrar la aceptación."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando declaración...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Inicio de pre-inscripción
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Declaración de veracidad
        </h1>
      </header>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        {data?.document?.text ? (
          <div
            className="prose prose-sm max-w-none text-[#711610]"
            dangerouslySetInnerHTML={{ __html: data.document.text }}
          />
        ) : (
          <p className="text-sm leading-6 text-[#711610]">
            La declaración inicial no está configurada. Comuníquese con admisión.
          </p>
        )}

        <label className="flex items-start gap-3 rounded-md border border-[#9A999D]/30 bg-[#E6D9AA]/15 px-4 py-3 text-sm leading-6 text-[#711610]">
          <input
            type="checkbox"
            checked={accepted}
            disabled={data?.accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1"
          />
          <span>
            Declaro que he leído y acepto continuar bajo responsabilidad, con información verídica y documentos válidos.
          </span>
        </label>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/my-profile"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
          <button
            type="button"
            onClick={submit}
            disabled={!accepted || isSubmitting || !data?.document}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            {data?.accepted ? "Continuar" : isSubmitting ? "Registrando..." : "Aceptar y continuar"}
          </button>
        </footer>
      </section>
    </section>
  );
}
