"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

  const canSubmit = useMemo(() => {
    const personOk = (person: PersonForm) =>
      person.status !== "available" ||
      (!!person.names.trim() &&
        !!person.last_names.trim() &&
        /^\d{8}$/.test(person.dni) &&
        !!person.address.trim() &&
        !!person.phone_primary.trim());

    const guardianOk =
      !guardian.enabled ||
      (!!guardian.relation &&
        !!guardian.names.trim() &&
        !!guardian.last_names.trim() &&
        /^\d{8}$/.test(guardian.dni) &&
        !!guardian.address.trim() &&
        !!guardian.phone_primary.trim());

    return personOk(father) && personOk(mother) && guardianOk;
  }, [father, mother, guardian]);

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
          onChange={setFather}
        />

        <FamilySection
          title="Madre"
          value={mother}
          onChange={setMother}
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
                onChange={(next) => setGuardian((current) => ({ ...current, ...next }))}
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
            disabled={isSubmitting || !canSubmit}
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
  onChange,
}: {
  title: string;
  value: PersonForm;
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
          onChange={(next) => onChange({ ...value, ...next })}
        />
      )}
    </section>
  );
}

function PersonFields({
  value,
  onChange,
}: {
  value: Pick<PersonForm, "names" | "last_names" | "dni" | "address" | "phone_primary" | "phone_secondary">;
  onChange: (value: Partial<PersonForm>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nombres" value={value.names} onChange={(names) => onChange({ names })} required />
      <Field
        label="Apellidos"
        value={value.last_names}
        onChange={(last_names) => onChange({ last_names })}
        required
      />
      <Field
        label="DNI"
        value={value.dni}
        onChange={(dni) => onChange({ dni })}
        required
        inputMode="numeric"
        maxLength={8}
      />
      <Field
        label="Teléfono principal"
        value={value.phone_primary}
        onChange={(phone_primary) => onChange({ phone_primary })}
        required
      />
      <label className="block text-sm md:col-span-2">
        <span className="mb-1 block font-medium text-[#711610]">Dirección</span>
        <input
          value={value.address}
          onChange={(event) => onChange({ address: event.target.value })}
          className="form-input"
          required
        />
      </label>
      <Field
        label="Teléfono secundario"
        value={value.phone_secondary}
        onChange={(phone_secondary) => onChange({ phone_secondary })}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric";
  maxLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#711610]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input"
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
      />
    </label>
  );
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
