"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import {
  FamilyDataPayload,
  FamilyMember,
  FamilyMemberStatus,
  getFamilyData,
  saveFamilyData,
} from "@/lib/applicant";

type PersonForm = {
  status: FamilyMemberStatus;
  names: string;
  last_names: string;
  dni: string;
  address: string;
  phone_primary: string;
  phone_secondary: string;
};

type GuardianForm = Omit<PersonForm, "status"> & {
  enabled: boolean;
  relation: "father" | "mother" | "third_party";
};

const emptyPerson: PersonForm = {
  status: "available",
  names: "",
  last_names: "",
  dni: "",
  address: "",
  phone_primary: "",
  phone_secondary: "",
};

const emptyGuardian: GuardianForm = {
  enabled: false,
  relation: "third_party",
  names: "",
  last_names: "",
  dni: "",
  address: "",
  phone_primary: "",
  phone_secondary: "",
};

export default function FamilyDataForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [father, setFather] = useState<PersonForm>(emptyPerson);
  const [mother, setMother] = useState<PersonForm>(emptyPerson);
  const [guardian, setGuardian] = useState<GuardianForm>(emptyGuardian);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedToken = getStoredAuthToken();
    if (!storedToken) {
      router.replace("/login-registro");
      return;
    }

    setToken(storedToken);

    getFamilyData(storedToken)
      .then((response) => {
        const members = response.family_members;
        setFather(memberToPerson(members.find((member) => member.type === "father")));
        setMother(memberToPerson(members.find((member) => member.type === "mother")));
        setGuardian(memberToGuardian(members.find((member) => member.type === "guardian")));
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar los datos familiares."
        );
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const nextFieldErrors = validateFamilyData(father, mother, guardian);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Revise los campos marcados antes de continuar.");
      return;
    }

    setFieldErrors({});
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await saveFamilyData(token, buildPayload(father, mother, guardian));
      window.dispatchEvent(new Event("admision-progress-updated"));
      setMessage("Datos familiares guardados correctamente.");
      router.push("/quiz");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudieron guardar los datos familiares."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10 text-sm font-medium text-[#711610]">
        Cargando datos familiares...
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
          Datos familiares
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">
          Familia y apoderado
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#711610]">
          Registre padre, madre y, si corresponde, un apoderado responsable.
        </p>
      </header>

      {(error || message) && (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FamilySection
          title="Padre"
          value={father}
          errors={fieldErrors}
          errorPrefix="father"
          onChange={(next) => {
            setFather(next);
            setFieldErrors((current) => clearErrors(current, "father"));
          }}
        />

        <FamilySection
          title="Madre"
          value={mother}
          errors={fieldErrors}
          errorPrefix="mother"
          onChange={(next) => {
            setMother(next);
            setFieldErrors((current) => clearErrors(current, "mother"));
          }}
        />

        <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
                Apoderado
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#711610]">
                Responsable adicional
              </h2>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#711610]">
              <input
                type="checkbox"
                checked={guardian.enabled}
                onChange={(event) =>
                  setGuardian((current) => ({ ...current, enabled: event.target.checked }))
                }
              />
              Registrar apoderado
            </label>
          </div>

          {guardian.enabled && (
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#711610]">Relación</span>
                <select
                  value={guardian.relation}
                  onChange={(event) =>
                    setGuardian((current) => ({
                      ...current,
                      relation: event.target.value as GuardianForm["relation"],
                    }))
                  }
                  className="form-input"
                  required
                >
                  <option value="father">Padre</option>
                  <option value="mother">Madre</option>
                  <option value="third_party">Otra persona</option>
                </select>
              </label>

              <PersonFields
                value={guardian}
                errors={fieldErrors}
                errorPrefix="guardian"
                onChange={(next) => {
                  setGuardian((current) => ({ ...current, ...next }));
                  setFieldErrors((current) => clearErrors(current, "guardian"));
                }}
              />
            </div>
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/documents"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </button>
        </footer>
      </form>
    </section>
  );
}

function FamilySection({
  title,
  value,
  errors,
  errorPrefix,
  onChange,
}: {
  title: string;
  value: PersonForm;
  errors: Record<string, string>;
  errorPrefix: string;
  onChange: (value: PersonForm) => void;
}) {
  return (
    <section className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9A999D]">
          Familiar
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#711610]">{title}</h2>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#711610]">Estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            onChange({ ...value, status: event.target.value as FamilyMemberStatus })
          }
          className="form-input"
          required
        >
          <option value="available">Disponible</option>
          <option value="deceased">Fallecido</option>
          <option value="not_present">No presente</option>
        </select>
      </label>

      {value.status === "available" && (
        <PersonFields
          value={value}
          errors={errors}
          errorPrefix={errorPrefix}
          onChange={(next) => onChange({ ...value, ...next })}
        />
      )}
    </section>
  );
}

function PersonFields({
  value,
  errors,
  errorPrefix,
  onChange,
}: {
  value: Pick<PersonForm, "names" | "last_names" | "dni" | "address" | "phone_primary" | "phone_secondary">;
  errors: Record<string, string>;
  errorPrefix: string;
  onChange: (value: Partial<PersonForm>) => void;
}) {
  const error = (field: keyof PersonForm) => errors[`${errorPrefix}.${field}`] ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nombres" value={value.names} onChange={(names) => onChange({ names })} error={error("names")} required />
      <Field
        label="Apellidos"
        value={value.last_names}
        onChange={(last_names) => onChange({ last_names })}
        error={error("last_names")}
        required
      />
      <Field
        label="DNI"
        value={value.dni}
        onChange={(dni) => onChange({ dni: digitsOnly(dni, 8) })}
        error={error("dni")}
        required
        inputMode="numeric"
        maxLength={8}
      />
      <Field
        label="Teléfono principal"
        value={value.phone_primary}
        onChange={(phone_primary) => onChange({ phone_primary: digitsOnly(phone_primary, 9) })}
        error={error("phone_primary")}
        required
        inputMode="numeric"
        maxLength={9}
      />
      <label className="block text-sm md:col-span-2">
        <span className="mb-1 block font-medium text-[#711610]">Dirección</span>
        <input
          value={value.address}
          onChange={(event) => onChange({ address: event.target.value })}
          className={`form-input ${error("address") ? "border-red-400" : ""}`}
          required
        />
        {error("address") && <span className="mt-1 block text-xs font-medium text-red-700">{error("address")}</span>}
      </label>
      <Field
        label="Teléfono secundario"
        value={value.phone_secondary}
        onChange={(phone_secondary) => onChange({ phone_secondary: digitsOnly(phone_secondary, 9) })}
        error={error("phone_secondary")}
        inputMode="numeric"
        maxLength={9}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
  maxLength,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric";
  maxLength?: number;
  error?: string | null;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`form-input ${error ? "border-red-400" : ""}`}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  );
}

function validateFamilyData(father: PersonForm, mother: PersonForm, guardian: GuardianForm) {
  const errors: Record<string, string> = {};
  validatePerson("father", father, errors);
  validatePerson("mother", mother, errors);

  if (guardian.enabled) {
    validatePerson("guardian", { ...guardian, status: "available" }, errors);
  }

  return errors;
}

function validatePerson(prefix: string, person: PersonForm, errors: Record<string, string>) {
  if (person.status !== "available") return;

  if (!person.names.trim()) errors[`${prefix}.names`] = "Ingrese nombres.";
  if (!person.last_names.trim()) errors[`${prefix}.last_names`] = "Ingrese apellidos.";
  if (!/^\d{8}$/.test(person.dni)) errors[`${prefix}.dni`] = "El DNI debe tener exactamente 8 dígitos.";
  if (!person.address.trim()) errors[`${prefix}.address`] = "Ingrese dirección.";
  if (!/^\d{9}$/.test(person.phone_primary)) errors[`${prefix}.phone_primary`] = "El teléfono debe tener exactamente 9 dígitos.";
  if (person.phone_secondary && !/^\d{9}$/.test(person.phone_secondary)) {
    errors[`${prefix}.phone_secondary`] = "El teléfono secundario debe tener exactamente 9 dígitos.";
  }
}

function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function clearErrors(errors: Record<string, string>, prefix: string) {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(`${prefix}.`)));
}

function memberToPerson(member?: FamilyMember): PersonForm {
  if (!member) return emptyPerson;

  return {
    status: member.status ?? "available",
    names: member.names ?? "",
    last_names: member.last_names ?? "",
    dni: member.dni ?? "",
    address: member.address ?? "",
    phone_primary: member.phone_primary ?? "",
    phone_secondary: member.phone_secondary ?? "",
  };
}

function memberToGuardian(member?: FamilyMember): GuardianForm {
  if (!member) return emptyGuardian;

  return {
    enabled: true,
    relation: member.guardian_relation ?? "third_party",
    names: member.names ?? "",
    last_names: member.last_names ?? "",
    dni: member.dni ?? "",
    address: member.address ?? "",
    phone_primary: member.phone_primary ?? "",
    phone_secondary: member.phone_secondary ?? "",
  };
}

function buildPayload(
  father: PersonForm,
  mother: PersonForm,
  guardian: GuardianForm
): FamilyDataPayload {
  const normalizePerson = (person: PersonForm) => ({
    status: person.status,
    names: person.status === "available" ? nullable(person.names) : null,
    last_names: person.status === "available" ? nullable(person.last_names) : null,
    dni: person.status === "available" ? nullable(person.dni) : null,
    address: person.status === "available" ? nullable(person.address) : null,
    phone_primary: person.status === "available" ? nullable(person.phone_primary) : null,
    phone_secondary: person.status === "available" ? nullable(person.phone_secondary) : null,
  });

  return {
    father: normalizePerson(father),
    mother: normalizePerson(mother),
    guardian: {
      enabled: guardian.enabled,
      relation: guardian.enabled ? guardian.relation : null,
      names: guardian.enabled ? nullable(guardian.names) : null,
      last_names: guardian.enabled ? nullable(guardian.last_names) : null,
      dni: guardian.enabled ? nullable(guardian.dni) : null,
      address: guardian.enabled ? nullable(guardian.address) : null,
      phone_primary: guardian.enabled ? nullable(guardian.phone_primary) : null,
      phone_secondary: guardian.enabled ? nullable(guardian.phone_secondary) : null,
    },
  };
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
