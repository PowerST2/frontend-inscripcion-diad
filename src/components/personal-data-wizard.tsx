"use client";

import Link from "next/link";
import { useState } from "react";

type InternalStep = 1 | 2 | 3;

export default function PersonalDataWizard() {
  const [step, setStep] = useState<InternalStep>(1);

  const goNext = () => setStep((prev) => (prev < 3 ? ((prev + 1) as InternalStep) : prev));
  const goBack = () => setStep((prev) => (prev > 1 ? ((prev - 1) as InternalStep) : prev));

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-10">
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso interno {step} de 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">Datos Personales</h1>
      </header>

      <div className="mb-6 rounded-lg border border-[#711610]/30 bg-[#E6D9AA]/35 p-4 text-sm text-[#711610]">
        <p className="font-semibold">Importante</p>
        <p>
          Complete solo los datos del postulante. No registrar datos del padre, madre o apoderado.
        </p>
      </div>

      <div className="rounded-lg border border-[#9A999D]/30 bg-white p-5">
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-[#711610]">Datos de identidad del postulante (ejemplo)</p>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Tipo de documento</span>
              <select className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]">
                <option value="DNI">DNI</option>
                <option value="PASSPORT">PASSPORT</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Numero de documento</span>
              <input
                type="text"
                placeholder="Ingrese DNI o Passport del postulante"
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Apellido paterno</span>
              <input
                type="text"
                placeholder="Apellido paterno del postulante"
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Apellido materno</span>
              <input
                type="text"
                placeholder="Apellido materno del postulante"
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Nombres</span>
              <input
                type="text"
                placeholder="Nombres del postulante"
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#711610]">Subida de foto del postulante</p>
            <div className="rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610]">
              <p className="font-medium">Cargar foto del postulante</p>
              <p className="mt-1 text-[#9A999D]">Use una foto reciente y clara del postulante.</p>
              <input type="file" accept="image/*" className="mx-auto mt-4 block w-full max-w-xs text-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-[#711610]">Subida de documento de identidad del postulante</p>
            <div className="rounded-lg border border-dashed border-[#9A999D] bg-[#E6D9AA]/20 p-6 text-center text-sm text-[#711610]">
              <p className="font-medium">Cargar DNI o Passport del postulante</p>
              <p className="mt-1 text-[#9A999D]">Verifique que el documento corresponda al postulante.</p>
              <input
                type="file"
                accept="image/*,.pdf"
                className="mx-auto mt-4 block w-full max-w-xs text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3">
        {step === 1 ? (
          <Link
            href="/login-registro"
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
          >
            Siguiente
          </button>
        ) : (
          <Link
            href="/modality"
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
          >
            Siguiente
          </Link>
        )}
      </footer>
    </section>
  );
}
