"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { FiBell } from "react-icons/fi";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AuthUser, logout } from "@/lib/auth";
import { ApplicantProgress, getApplicantProgress } from "@/lib/applicant";
import { canAccessFlowPath, getNextFlowStep } from "@/lib/admission-flow";

const PUBLIC_PATHS = new Set(["/", "/login-registro"]);
const THEME_STORAGE_KEY = "admision_theme";

export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState<ApplicantProgress | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const isPublicPath = useMemo(() => PUBLIC_PATHS.has(pathname), [pathname]);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const shouldUseDarkMode = storedTheme === "dark";

    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setIsDarkMode(shouldUseDarkMode);
    document.documentElement.classList.toggle("theme-dark", shouldUseDarkMode);
    setReady(true);

    if (!storedToken && !isPublicPath) {
      router.replace("/login-registro");
    }
  }, [isPublicPath, router]);

  useEffect(() => {
    if (!token) {
      setProgress(null);
      return;
    }

    const refreshProgress = () => {
      getApplicantProgress(token)
      .then(setProgress)
      .catch(() => setProgress(null));
    };

    refreshProgress();
    window.addEventListener("admision-progress-updated", refreshProgress);

    return () => window.removeEventListener("admision-progress-updated", refreshProgress);
  }, [token, pathname]);

  useEffect(() => {
    if (!token || !progress || isPublicPath || pathname === "/my-profile") {
      return;
    }

    if (!canAccessFlowPath(pathname, progress)) {
      router.replace(getNextFlowStep(progress).href);
    }
  }, [isPublicPath, pathname, progress, router, token]);

  const notifications = useMemo(() => buildNotifications(progress), [progress]);
  const notificationCount = notifications.pending.length + notifications.admin.length;

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      document.documentElement.classList.toggle("theme-dark", next);
      return next;
    });
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logout(token);
      } catch {
        // El token local debe descartarse aunque el servidor ya no lo reconozca.
      }
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
    router.replace("/login-registro");
  };

  if (!ready || (!token && !isPublicPath)) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-[#E6D9AA]/20 text-sm font-medium text-[#711610]">
        Cargando...
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#E6D9AA]/20 text-[#711610]">
      <header className="app-header border-b border-[#9A999D]/40 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/uni.png"
              alt="Logo UNI"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <p className="text-base font-semibold md:text-lg">Inscripciones 2026-1</p>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-[#711610] px-3 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              {isDarkMode ? "Claro" : "Oscuro"}
            </button>

            {token ? (
              <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((current) => !current)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#711610] text-[#711610] hover:bg-[#711610]/10"
                  aria-label="Notificaciones"
                >
                  <FiBell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#711610] px-1 text-[11px] font-semibold text-white">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[#9A999D]/30 bg-white p-4 text-[#711610] shadow-xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Notificaciones</p>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-medium text-[#9A999D] hover:text-[#711610]"
                      >
                        Cerrar
                      </button>
                    </div>

                    {notificationCount === 0 ? (
                      <p className="rounded-md bg-[#E6D9AA]/25 px-3 py-2 text-sm">
                        No tienes pendientes por ahora.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {notifications.pending.length > 0 && (
                          <NotificationSection title="Pendiente por hacer" items={notifications.pending} />
                        )}

                        {notifications.admin.length > 0 && (
                          <NotificationSection
                            title="Pendiente por evaluacion administrativa"
                            items={notifications.admin}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="hidden max-w-48 truncate text-sm font-medium text-[#711610] sm:block">
                {user?.name ?? user?.email}
              </span>
              <Link
                href="/my-profile"
                className="rounded-md border border-[#711610] px-4 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
              >
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-[#711610] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
              >
                Salir
              </button>
              </>
            ) : (
              <Link
                href="/login-registro"
                className="rounded-md bg-[#711610] px-4 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1">{children}</main>

      <footer className="app-footer border-t border-[#9A999D]/30 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-3 text-xs text-[#9A999D] md:px-6">
          Universidad Nacional de Ingenieria - Proceso de inscripciones
        </div>
      </footer>
    </div>
  );
}

type NotificationItem = {
  label: string;
  href?: string;
};

function buildNotifications(progress: ApplicantProgress | null): {
  pending: NotificationItem[];
  admin: NotificationItem[];
} {
  if (!progress) {
    return { pending: [], admin: [] };
  }

  const pending: NotificationItem[] = [];
  const admin: NotificationItem[] = [];
  const state = progress.progress;
  const applicant = progress.applicant;

  if (!state.initial_consent_complete) {
    pending.push({ label: "Aceptar declaracion inicial de veracidad", href: "/pre-inscription-affidavit" });
    return { pending, admin };
  }

  if (!state.identity_complete) {
    pending.push({ label: "Completar datos personales", href: "/personal-data" });
  }

  if (!state.photo_complete) {
    pending.push({ label: "Subir foto del postulante", href: "/personal-data" });
  } else if (applicant?.photo_status === "pending") {
    admin.push({ label: "Foto pendiente de aprobacion", href: "/personal-data" });
  } else if (applicant?.photo_status === "rejected") {
    pending.push({ label: "Foto rechazada: subir una nueva foto", href: "/personal-data" });
  }

  if (!state.identity_document_complete) {
    pending.push({ label: "Subir documento de identidad", href: "/personal-data" });
  }

  if ((applicant?.documents_review?.pending_count ?? 0) > 0) {
    admin.push({
      label: `${applicant?.documents_review?.pending_count} documento(s) pendiente(s) de evaluacion`,
      href: "/documents",
    });
  }

  if ((applicant?.documents_review?.rejected_count ?? 0) > 0) {
    pending.push({
      label: `${applicant?.documents_review?.rejected_count} documento(s) rechazado(s): volver a subir`,
      href: "/documents",
    });
  }

  if (!state.modality_complete) {
    pending.push({ label: "Elegir modalidad y especialidad", href: "/modality" });
  }

  if (!state.family_complete) {
    pending.push({ label: "Completar datos familiares", href: "/family-data" });
  }

  if (!state.quiz_complete) {
    pending.push({ label: "Responder encuesta de postulante", href: "/quiz" });
  }

  if (!state.sworn_declaration_complete) {
    if (applicant?.sworn_declaration?.status === "pending") {
      admin.push({ label: "Declaracion jurada pendiente de aprobacion", href: "/sworn-affidavit" });
    } else if (applicant?.sworn_declaration?.status === "rejected") {
      pending.push({ label: "Declaracion jurada observada: volver a subir", href: "/sworn-affidavit" });
    } else {
      pending.push({ label: "Subir declaracion jurada", href: "/sworn-affidavit" });
    }
  }

  if (state.sworn_declaration_complete && !state.payments_generated) {
    admin.push({ label: "Esperando generacion de pago por administracion", href: "/payment" });
  }

  if (state.payments_generated && !state.payments_complete) {
    pending.push({ label: "Completar y validar pago", href: "/payment" });
  }

  if (!state.data_confirmed) {
    pending.push({ label: "Confirmar datos de inscripcion", href: "/resume" });
  }

  if (state.data_confirmed && !state.satisfaction_survey_complete) {
    pending.push({ label: "Responder encuesta final de satisfaccion", href: "/satisfaction" });
  }

  return { pending, admin };
}

function NotificationSection({ title, items }: { title: string; items: NotificationItem[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9A999D]">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="block rounded-md border border-[#9A999D]/25 px-3 py-2 text-sm hover:border-[#711610] hover:bg-[#711610]/5"
              >
                {item.label}
              </Link>
            ) : (
              <span className="block rounded-md border border-[#9A999D]/25 px-3 py-2 text-sm">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
