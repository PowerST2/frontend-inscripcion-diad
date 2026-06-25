"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import { getSatisfactionSurvey, saveSatisfactionSurvey } from "@/lib/applicant";

type FormState = {
  overall_rating: string;
  ease_rating: string;
  speed_rating: string;
  clarity_rating: string;
  upload_experience_rating: string;
  support_rating: string;
  nps_score: string;
  hardest_step: string;
  had_technical_issue: boolean;
  technical_issue_detail: string;
  improvement_suggestion: string;
  would_recommend: string;
};

const initialForm: FormState = {
  overall_rating: "",
  ease_rating: "",
  speed_rating: "",
  clarity_rating: "",
  upload_experience_rating: "",
  support_rating: "",
  nps_score: "",
  hardest_step: "",
  had_technical_issue: false,
  technical_issue_detail: "",
  improvement_suggestion: "",
  would_recommend: "",
};

export default function SatisfactionSurveyForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }
    setToken(storedToken);

    getSatisfactionSurvey(storedToken)
      .then((response) => {
        if (response.data) {
          setIsCompleted(true);
          router.replace("/registration-complete");
        }
      })
      .catch(() => undefined);
  }, [router]);

  const canSubmit =
    !!form.overall_rating &&
    !!form.ease_rating &&
    !!form.speed_rating &&
    !!form.clarity_rating &&
    !!form.upload_experience_rating &&
    !!form.nps_score;

  const setField = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!canSubmit) {
      setError("Completa las calificaciones obligatorias antes de enviar la encuesta.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await saveSatisfactionSurvey(token, {
        overall_rating: Number(form.overall_rating),
        ease_rating: Number(form.ease_rating),
        speed_rating: Number(form.speed_rating),
        clarity_rating: Number(form.clarity_rating),
        upload_experience_rating: Number(form.upload_experience_rating),
        support_rating: form.support_rating ? Number(form.support_rating) : null,
        nps_score: Number(form.nps_score),
        hardest_step: nullable(form.hardest_step),
        had_technical_issue: form.had_technical_issue,
        technical_issue_detail: form.had_technical_issue ? nullable(form.technical_issue_detail) : null,
        improvement_suggestion: nullable(form.improvement_suggestion),
        would_recommend: form.would_recommend === "" ? null : form.would_recommend === "yes",
        metadata: {
          user_agent: navigator.userAgent,
          submitted_from: "frontend",
        },
      });
      window.dispatchEvent(new Event("admision-progress-updated"));
      setIsCompleted(true);
      router.push("/registration-complete");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo guardar la encuesta final."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-xl border border-[#711610]/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#711610]/80">
          Encuesta final
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#711610] md:text-3xl">
          Satisfacción del sistema
        </h1>

        <div className="mt-5 flex items-start gap-3 rounded-lg border-l-4 border-[#E6D9AA] bg-[#E6D9AA]/20 px-4 py-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#711610]/10 text-xs font-bold text-[#711610]">
            i
          </div>

          <p className="text-sm leading-6 text-[#711610]/90">
            Califica cada aspecto del{" "}
            <span className="font-semibold text-[#711610]">0 al 10</span> donde:{" "}
            <span className="font-semibold text-[#711610]">0</span> significa pésimo y{" "}
            <span className="font-semibold text-[#711610]">10</span> excelente.
          </p>
        </div>
      </header>

      {(error || message) && (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Rating label="Experiencia general" value={form.overall_rating} onChange={(value) => setField("overall_rating", value)} />
          <Rating label="Facilidad del proceso" value={form.ease_rating} onChange={(value) => setField("ease_rating", value)} />
          <Rating label="Rapidez del sistema" value={form.speed_rating} onChange={(value) => setField("speed_rating", value)} />
          <Rating label="Claridad de instrucciones" value={form.clarity_rating} onChange={(value) => setField("clarity_rating", value)} />
          <Rating label="Subida de archivos" value={form.upload_experience_rating} onChange={(value) => setField("upload_experience_rating", value)} />
          <Rating label="Soporte recibido" value={form.support_rating} onChange={(value) => setField("support_rating", value)} optional />
          <Rating label="¿Qué tan probable es que recomiende este sistema? (0 a 10)" value={form.nps_score} onChange={(value) => setField("nps_score", value)} optional />

        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea label="Paso más difícil" value={form.hardest_step} onChange={(value) => setField("hardest_step", value)} />
          <TextArea label="Sugerencia de mejora" value={form.improvement_suggestion} onChange={(value) => setField("improvement_suggestion", value)} />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-[#711610]">
          <input
            type="checkbox"
            checked={form.had_technical_issue}
            onChange={(event) => setField("had_technical_issue", event.target.checked)}
          />
          Tuve un problema técnico
        </label>

        {form.had_technical_issue && (
          <TextArea label="Detalle del problema técnico" value={form.technical_issue_detail} onChange={(value) => setField("technical_issue_detail", value)} />
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#711610]">¿Recomendaría el sistema?</span>
          <select
            value={form.would_recommend}
            onChange={(event) => setField("would_recommend", event.target.value)}
            className="form-input"
          >
            <option value="">Prefiero no responder</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/my-profile" className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10">
            Mi perfil
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isCompleted}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            {isCompleted ? "Encuesta enviada" : isSubmitting ? "Guardando..." : "Enviar encuesta"}
          </button>
        </footer>
      </form>
    </section>
  );
}

function Rating({ label, value, onChange, optional }: { label: string; value: string; onChange: (value: string) => void; optional?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input" required={!optional}>
        <option value="">{optional ? "No aplica" : "Seleccione"}</option>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <option key={rating} value={rating}>{rating}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="form-input min-h-[110px] resize-y" />
    </label>
  );
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
