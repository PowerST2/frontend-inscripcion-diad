"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { ApplicantPayment, getApplicantPayments } from "@/lib/applicant";

export default function PaymentStatus() {
  const router = useRouter();
  const [payments, setPayments] = useState<ApplicantPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.replace("/login-registro");
      return;
    }

    getApplicantPayments(token)
      .then((response) => setPayments(response.data))
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar los pagos."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const allPaid = payments.length > 0 && payments.every((payment) => payment.is_paid);
  const total = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [payments]
  );

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando pagos...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Pagos
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Obligaciones de pago
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#711610]">
          El pago se habilita cuando administración aprueba la declaración jurada.
        </p>
      </header>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        {payments.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Todavía no se han generado pagos. Si ya subió la declaración jurada, espere su evaluación administrativa.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                  Total
                </p>
                <p className="text-2xl font-semibold text-[#711610]">
                  S/ {total.toFixed(2)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  allPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {allPaid ? "Pago validado" : "Pendiente de pago"}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#9A999D]/30">
              {payments.map((payment) => (
                <div
                  key={`${payment.tariff_code}-${payment.description}`}
                  className="grid gap-3 border-b border-[#9A999D]/20 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <p className="font-semibold text-[#711610]">{payment.description}</p>
                    <p className="text-xs text-[#9A999D]">Código: {payment.tariff_code ?? "-"}</p>
                  </div>
                  <p className="font-semibold text-[#711610]">S/ {Number(payment.amount).toFixed(2)}</p>
                  <p className={payment.is_paid ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
                    {payment.is_paid ? `Pagado ${payment.payment_date ?? ""}` : "Pendiente"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/my-profile"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Mi perfil
          </Link>
          <Link
            href="/resume"
            className={`rounded-md px-5 py-2 text-sm font-medium text-white ${
              allPaid ? "bg-[#711610] hover:bg-[#5e120d]" : "pointer-events-none bg-[#9A999D]"
            }`}
          >
            Continuar
          </Link>
        </footer>
      </section>
    </section>
  );
}
