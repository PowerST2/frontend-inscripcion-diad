"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Faculty } from "@/components/modality/faculties-data";

export type SpecialtiesSelection = {
  facultyCode: string;
  facultyName: string;
  firstSpecialtyCode: string;
  firstSpecialtyName: string;
  secondSpecialtyCode?: string;
  secondSpecialtyName?: string;
};

type FacultySpecialtiesFormProps = {
  faculties: Faculty[];
  initialSelection: SpecialtiesSelection | null;
  isSaved: boolean;
  onBack: () => void;
  onSave: (selection: SpecialtiesSelection) => void;
  continueHref: string;
};

export default function FacultySpecialtiesForm({
  faculties,
  initialSelection,
  isSaved,
  onBack,
  onSave,
  continueHref,
}: FacultySpecialtiesFormProps) {
  const [facultyCode, setFacultyCode] = useState("");
  const [firstSpecialtyCode, setFirstSpecialtyCode] = useState("");
  const [showSecond, setShowSecond] = useState(false);
  const [secondSpecialtyCode, setSecondSpecialtyCode] = useState("");

  useEffect(() => {
    if (!initialSelection) return;

    setFacultyCode(initialSelection.facultyCode);
    setFirstSpecialtyCode(initialSelection.firstSpecialtyCode);
    setShowSecond(Boolean(initialSelection.secondSpecialtyCode));
    setSecondSpecialtyCode(initialSelection.secondSpecialtyCode ?? "");
  }, [initialSelection]);

  const selectedFaculty = useMemo(
    () => faculties.find((faculty) => faculty.code === facultyCode) ?? null,
    [faculties, facultyCode],
  );

  const firstSpecialty = useMemo(
    () => selectedFaculty?.specialties.find((specialty) => specialty.code === firstSpecialtyCode) ?? null,
    [selectedFaculty, firstSpecialtyCode],
  );

  const secondSpecialtyOptions = useMemo(
    () => selectedFaculty?.specialties.filter((specialty) => specialty.code !== firstSpecialtyCode) ?? [],
    [selectedFaculty, firstSpecialtyCode],
  );

  const secondSpecialty = useMemo(
    () => secondSpecialtyOptions.find((specialty) => specialty.code === secondSpecialtyCode) ?? null,
    [secondSpecialtyOptions, secondSpecialtyCode],
  );

  const supportsSecondSpecialty = Boolean(
    selectedFaculty && selectedFaculty.specialties.length > 1 && selectedFaculty.code !== "C",
  );

  const canSave =
    selectedFaculty &&
    firstSpecialty &&
    (!showSecond || (showSecond && secondSpecialty && secondSpecialty.code !== firstSpecialty.code));

  const handleFacultyChange = (value: string) => {
    setFacultyCode(value);
    setFirstSpecialtyCode("");
    setShowSecond(false);
    setSecondSpecialtyCode("");
  };

  const handleFirstSpecialtyChange = (value: string) => {
    setFirstSpecialtyCode(value);
    if (value === secondSpecialtyCode) {
      setSecondSpecialtyCode("");
    }
  };

  const addSecondSpecialty = () => {
    setShowSecond(true);
    setSecondSpecialtyCode("");
  };

  const removeSecondSpecialty = () => {
    setShowSecond(false);
    setSecondSpecialtyCode("");
  };

  const save = () => {
    if (!selectedFaculty || !firstSpecialty) return;

    onSave({
      facultyCode: selectedFaculty.code,
      facultyName: selectedFaculty.name,
      firstSpecialtyCode: firstSpecialty.code,
      firstSpecialtyName: firstSpecialty.name,
      secondSpecialtyCode: showSecond ? secondSpecialty?.code : undefined,
      secondSpecialtyName: showSecond ? secondSpecialty?.name : undefined,
    });
  };

  return (
    <>
      <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso interno 4 de 4</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">Facultad y Especialidades</h1>
        <p className="mt-2 text-sm text-[#711610]">
          Seleccione la facultad y hasta dos especialidades del postulante. En Ingenieria Civil solo se permite una.
        </p>
      </header>

      <div className="space-y-5 rounded-lg border border-[#9A999D]/30 bg-white p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#711610]">Facultad</span>
          <select
            value={facultyCode}
            onChange={(event) => handleFacultyChange(event.target.value)}
            className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
          >
            <option value="">Seleccione una facultad</option>
            {faculties.map((faculty) => (
              <option key={faculty.code} value={faculty.code}>
                {faculty.code} - {faculty.name}
              </option>
            ))}
          </select>
        </label>

        {selectedFaculty && (
          <article className="overflow-hidden rounded-lg border border-[#9A999D]/30">
            <Image
              src={selectedFaculty.imageUrl}
              alt={selectedFaculty.name}
              width={1200}
              height={480}
              className="h-48 w-full object-cover"
            />
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase text-[#711610]">Facultad seleccionada</p>
              <h2 className="text-lg font-semibold text-[#711610]">{selectedFaculty.name}</h2>
              <p className="text-sm text-[#711610]">Codigo: {selectedFaculty.code}</p>
            </div>
          </article>
        )}

        {selectedFaculty && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#711610]">Especialidad 1 (obligatoria)</span>
              <select
                value={firstSpecialtyCode}
                onChange={(event) => handleFirstSpecialtyChange(event.target.value)}
                className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
              >
                <option value="">Seleccione la primera especialidad</option>
                {selectedFaculty.specialties.map((specialty) => (
                  <option key={specialty.code} value={specialty.code}>
                    {specialty.code} - {specialty.name}
                  </option>
                ))}
              </select>
            </label>

            {supportsSecondSpecialty && firstSpecialtyCode && !showSecond && (
              <button
                type="button"
                onClick={addSecondSpecialty}
                className="rounded-md border border-[#711610] px-4 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
              >
                Agregar segunda especialidad
              </button>
            )}

            {showSecond && supportsSecondSpecialty && (
              <div className="space-y-3 rounded-md border border-[#711610]/20 bg-[#E6D9AA]/20 p-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#711610]">Especialidad 2 (opcional)</span>
                  <select
                    value={secondSpecialtyCode}
                    onChange={(event) => setSecondSpecialtyCode(event.target.value)}
                    className="w-full rounded-md border border-[#9A999D]/50 px-3 py-2 outline-none focus:border-[#711610]"
                  >
                    <option value="">Seleccione la segunda especialidad</option>
                    {secondSpecialtyOptions.map((specialty) => (
                      <option key={specialty.code} value={specialty.code}>
                        {specialty.code} - {specialty.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={removeSecondSpecialty}
                  className="rounded-md border border-[#9A999D] px-4 py-2 text-sm font-medium text-[#9A999D] hover:bg-[#9A999D]/10"
                >
                  Retirar segunda opcion
                </button>
              </div>
            )}

            {selectedFaculty.code === "C" && (
              <p className="rounded-md border border-[#711610]/20 bg-[#E6D9AA]/25 p-3 text-sm text-[#711610]">
                Ingenieria Civil solo permite una especialidad en este proceso.
              </p>
            )}
          </div>
        )}
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
        >
          Regresar
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white enabled:hover:bg-[#5e120d] disabled:cursor-not-allowed disabled:bg-[#9A999D]"
          >
            Guardar especialidades
          </button>

          {isSaved ? (
            <Link
              href={continueHref}
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Siguiente
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md border border-[#9A999D] px-5 py-2 text-sm font-medium text-[#9A999D]"
            >
              Siguiente
            </button>
          )}
        </div>
      </footer>
    </>
  );
}
