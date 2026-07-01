"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  login,
  persistAuthSession,
  register,
} from "@/lib/auth";
import { ADMISSION_PROCESS_LABEL, getSiteLabels } from "@/lib/site";

type AuthMode = "login" | "register";

export default function LoginRegisterForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [paternalSurname, setPaternalSurname] = useState("");
  const [maternalSurname, setMaternalSurname] = useState("");
  const [names, setNames] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admissionProcessLabel, setAdmissionProcessLabel] = useState(ADMISSION_PROCESS_LABEL);

  const isRegister = mode === "register";

  useEffect(() => {
    getSiteLabels()
    .then((labels) => setAdmissionProcessLabel(labels.admissionProcessLabel))
    .catch(() => setAdmissionProcessLabel(ADMISSION_PROCESS_LABEL));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = isRegister
        ? await register({
            paternal_surname: paternalSurname.trim(),
            maternal_surname: maternalSurname.trim(),
            names: names.trim(),
            email,
            password,
            password_confirmation: passwordConfirmation,
          })
        : await login({ email, password });

      persistAuthSession(response);

      router.push(isRegister ? "/pre-inscription-affidavit" : "/my-profile");

      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
        setFieldErrors(caughtError.errors ?? {});
      } else {
        setError("No se pudo conectar con el servidor de admision.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstFieldError = (field: string) => fieldErrors[field]?.[0] ?? null;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10 md:px-6">
      <div className="grid w-full overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[#711610] p-6 text-white md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#E6D9AA]">
            {admissionProcessLabel}
          </p>
          <h1 className="mt-4 text-2xl font-semibold md:text-3xl">
            Acceso al portal del postulante
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/80">
            Inicia sesion con tu correo registrado o crea una cuenta para continuar tu proceso de
            inscripcion.
          </p>
        </aside>

        <div className="p-6 md:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-md border border-[#711610]/20 bg-[#E6D9AA]/25 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`cursor-pointer rounded px-3 py-2 text-sm font-semibold transition hover:bg-white hover:text-[#711610] hover:shadow-sm ${
                !isRegister ? "bg-white text-[#711610] shadow-sm" : "text-[#711610]/70"
              }`}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`cursor-pointer rounded px-3 py-2 text-sm font-semibold transition hover:bg-white hover:text-[#711610] hover:shadow-sm ${
                isRegister ? "bg-white text-[#711610] shadow-sm" : "text-[#711610]/70"
              }`}
            >
              Registrarme
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Apellido paterno</span>
                  <input
                    type="text"
                    value={paternalSurname}
                    onChange={(event) => setPaternalSurname(event.target.value)}
                    className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                    autoComplete="family-name"
                    maxLength={50}
                    required
                  />
                  {firstFieldError("paternal_surname") && (
                    <span className="mt-1 block text-xs text-red-700">{firstFieldError("paternal_surname")}</span>
                  )}
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Apellido materno</span>
                  <input
                    type="text"
                    value={maternalSurname}
                    onChange={(event) => setMaternalSurname(event.target.value)}
                    className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                    autoComplete="additional-name"
                    maxLength={50}
                    required
                  />
                  {firstFieldError("maternal_surname") && (
                    <span className="mt-1 block text-xs text-red-700">{firstFieldError("maternal_surname")}</span>
                  )}
                </label>

                <label className="block text-sm md:col-span-2">
                  <span className="mb-1 block font-medium text-[#711610]">Nombres</span>
                  <input
                    type="text"
                    value={names}
                    onChange={(event) => setNames(event.target.value)}
                    className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                    autoComplete="given-name"
                    maxLength={100}
                    required
                  />
                  {firstFieldError("names") && (
                    <span className="mt-1 block text-xs text-red-700">{firstFieldError("names")}</span>
                  )}
                </label>
              </div>
            )}

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Correo electronico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                autoComplete="email"
                required
              />
              {firstFieldError("email") && (
                <span className="mt-1 block text-xs text-red-700">{firstFieldError("email")}</span>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Contrasena</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
              {firstFieldError("password") && (
                <span className="mt-1 block text-xs text-red-700">{firstFieldError("password")}</span>
              )}
            </label>

            {isRegister && (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#711610]">
                  Confirmar contrasena
                </span>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 text-[#171717] outline-none focus:border-[#711610]"
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#711610] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
            >
              {isSubmitting ? "Procesando..." : isRegister ? "Crear cuenta" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
