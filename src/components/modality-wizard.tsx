"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FacultySpecialtiesForm, {
  type SpecialtiesSelection,
} from "@/components/modality/faculty-specialties-form";
import { FACULTIES } from "@/components/modality/faculties-data";

type FinalModality = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

type Division = {
  id: string;
  title: string;
  audience: string;
  imageUrl: string;
  modalities: FinalModality[];
};

type Screen = 1 | 2 | 3 | 4;

type StoredSelection = {
  divisionId: string;
  divisionTitle: string;
  modalityId: string;
  modalityTitle: string;
  selectedAt: string;
};

type StoredSpecialtiesSelection = SpecialtiesSelection & {
  divisionId: string;
  modalityId: string;
  selectedAt: string;
};

type SpecialtiesFlow = "default" | "none";

const STORAGE_MODALITY_KEY = "uni:selected_modality";
const STORAGE_SPECIALTIES_KEY = "uni:selected_specialties";

const divisions: Division[] = [
  {
    id: "iniciar-estudios",
    title: "Iniciar estudios",
    audience: "Para jovenes que recien culminaron la secundaria.",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    modalities: [
      {
        id: "ordinario",
        title: "Ordinario",
        description:
          "Dirigido a postulantes que culminaron sus estudios de educacion secundaria en instituciones del pais o su equivalente en el extranjero.",
        imageUrl:
          "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "primeros-puestos",
        title: "Primeros Puestos",
        description:
          "Para alumnos que ocuparon los primeros puestos en su promocion escolar y cumplen los requisitos documentarios establecidos por admision.",
        imageUrl:
          "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "deportista-alto-nivel",
        title: "Deportista Calificado de Alto Nivel",
        description:
          "Para deportistas certificados por el IPD que desean iniciar o continuar estudios y presentan la documentacion adicional exigida.",
        imageUrl:
          "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "plan-integral-reparaciones",
        title: "Plan Integral de Reparaciones",
        description:
          "Para egresados de secundaria o provenientes de otras universidades inscritos en el Registro Unico de Victimas de la Violencia.",
        imageUrl:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "persona-discapacidad-iniciar",
        title: "Persona con Discapacidad",
        description:
          "Para postulantes calificados como personas con discapacidad, de acuerdo con la Ley N. 29973 y su reglamento.",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "continuar-estudios",
    title: "Continuar estudios",
    audience: "Para personas que ya cursaron estudios superiores.",
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    modalities: [
      {
        id: "diplomado-bachillerato-internacional",
        title: "Diplomado con Bachillerato Internacional",
        description:
          "Para quienes obtuvieron diploma de Bachillerato Internacional y cumplen los requisitos academicos exigidos por admision.",
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "persona-discapacidad-continuar",
        title: "Persona con Discapacidad (continuar estudios)",
        description:
          "Para postulantes con discapacidad provenientes de otras universidades que acreditan su condicion con certificado valido.",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "convenio-andres-bello",
        title: "Convenio Andres Bello",
        description:
          "Para postulantes de estados miembros del convenio que desean iniciar o continuar estudios universitarios en la UNI.",
        imageUrl:
          "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "traslado-externo",
        title: "Traslado Externo",
        description:
          "Para estudiantes de pregrado de universidades publicas o privadas del pais o extranjero que cumplen creditos y requisitos.",
        imageUrl:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "traslado-externo-no-licenciadas",
        title: "Traslado Externo para estudiantes provenientes de universidades no licenciadas",
        description:
          "Para estudiantes de universidades que no alcanzaron licenciamiento SUNEDU, conforme a requisitos y documentacion establecida.",
        imageUrl:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "titulados-graduados-uni",
        title: "Titulados o Graduados UNI",
        description:
          "Para quienes obtuvieron grado de bachiller o titulo profesional en la UNI y desean estudiar otra especialidad.",
        imageUrl:
          "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "titulados-graduados-otra-universidad",
        title: "Titulados o Graduados en otra universidad",
        description:
          "Para quienes obtuvieron grado o titulo universitario en el pais o en el extranjero y cumplen requisitos de admision.",
        imageUrl:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "convenio-diplomatico",
        title: "Convenio Diplomatico para Hijo o Conyuge de Diplomatico",
        description:
          "Para personas incluidas en convenios diplomaticos, hijos o conyuges de diplomaticos que desean iniciar o continuar estudios.",
        imageUrl:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "ingreso-directo",
    title: "Ingreso Directo",
    audience: "Division separada para postulacion por ingreso directo.",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    modalities: [
      {
        id: "ingreso-directo-lima",
        title: "Ingreso directo Lima",
        description:
          "Dirigido a alumnos del CEPRE-UNI matriculados en el ciclo correspondiente al concurso y que cumplen los requisitos de admision.",
        imageUrl:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "ingreso-directo-juliaca",
        title: "Ingreso directo Juliaca",
        description:
          "Dirigido a alumnos del CEPRE-UNI de la sede correspondiente, matriculados en el ciclo vigente y con requisitos completos.",
        imageUrl:
          "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "ingreso-escolar-nacional",
    title: "Ingreso Escolar Nacional",
    audience: "Para estudiantes que cursan el ultimo anio de secundaria.",
    imageUrl:
      "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80",
    modalities: [
      {
        id: "ien",
        title: "Ingreso Escolar Nacional",
        description:
          "Proceso de admision dirigido a estudiantes que cursan el ultimo anio de secundaria en instituciones educativas del pais.",
        imageUrl:
          "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "talento-beca-18",
    title: "Talento Beca 18",
    audience: "Para estudiantes vinculados al programa PRONABEC.",
    imageUrl:
      "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=1200&q=80",
    modalities: [
      {
        id: "talento-beca-18",
        title: "Talento Beca 18",
        description:
          "Dirigido a estudiantes del ultimo anio o egresados de secundaria inscritos o preseleccionados por PRONABEC que cumplen requisitos de la modalidad.",
        imageUrl:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
];

function getSpecialtiesFlow(_modalityId: string): SpecialtiesFlow {
  return "default";
}

export default function ModalityWizard() {
  const [screen, setScreen] = useState<Screen>(1);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [selectedModalityId, setSelectedModalityId] = useState<string | null>(null);
  const [savedSelection, setSavedSelection] = useState<StoredSelection | null>(null);
  const [savedSpecialties, setSavedSpecialties] = useState<StoredSpecialtiesSelection | null>(null);
  const [showEditionFlow, setShowEditionFlow] = useState(false);

  useEffect(() => {
    const rawModality = sessionStorage.getItem(STORAGE_MODALITY_KEY);
    if (rawModality) {
      try {
        const parsed = JSON.parse(rawModality) as StoredSelection;
        setSavedSelection(parsed);
      } catch {
        sessionStorage.removeItem(STORAGE_MODALITY_KEY);
      }
    }

    const rawSpecialties = sessionStorage.getItem(STORAGE_SPECIALTIES_KEY);
    if (rawSpecialties) {
      try {
        const parsed = JSON.parse(rawSpecialties) as StoredSpecialtiesSelection;
        setSavedSpecialties(parsed);
      } catch {
        sessionStorage.removeItem(STORAGE_SPECIALTIES_KEY);
      }
    }
  }, []);

  const selectedDivision = useMemo(
    () => divisions.find((division) => division.id === selectedDivisionId) ?? null,
    [selectedDivisionId],
  );

  const selectedModality = useMemo(
    () => selectedDivision?.modalities.find((item) => item.id === selectedModalityId) ?? null,
    [selectedDivision, selectedModalityId],
  );

  const specialtiesFlow = useMemo(
    () => (selectedModality ? getSpecialtiesFlow(selectedModality.id) : "none"),
    [selectedModality],
  );

  const openDivision = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedModalityId(null);
    setScreen(2);
  };

  const openModality = (modalityId: string) => {
    setSelectedModalityId(modalityId);
    setScreen(3);
  };

  const saveSelection = () => {
    if (!selectedDivision || !selectedModality) return;

    const selection: StoredSelection = {
      divisionId: selectedDivision.id,
      divisionTitle: selectedDivision.title,
      modalityId: selectedModality.id,
      modalityTitle: selectedModality.title,
      selectedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(STORAGE_MODALITY_KEY, JSON.stringify(selection));
    setSavedSelection(selection);

    if (savedSpecialties && savedSpecialties.modalityId !== selectedModality.id) {
      sessionStorage.removeItem(STORAGE_SPECIALTIES_KEY);
      setSavedSpecialties(null);
    }
  };

  const saveSpecialtiesSelection = (selection: SpecialtiesSelection) => {
    if (!selectedDivision || !selectedModality) return;

    const payload: StoredSpecialtiesSelection = {
      ...selection,
      divisionId: selectedDivision.id,
      modalityId: selectedModality.id,
      selectedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(STORAGE_SPECIALTIES_KEY, JSON.stringify(payload));
    setSavedSpecialties(payload);
  };

  const isCurrentSelectionSaved = Boolean(
    savedSelection &&
      selectedDivision &&
      selectedModality &&
      savedSelection.divisionId === selectedDivision.id &&
      savedSelection.modalityId === selectedModality.id,
  );

  const isCurrentSpecialtiesSaved = Boolean(
    savedSpecialties &&
      selectedDivision &&
      selectedModality &&
      savedSpecialties.divisionId === selectedDivision.id &&
      savedSpecialties.modalityId === selectedModality.id,
  );

  const hasCompletedSetup = Boolean(savedSelection && savedSpecialties);

  const currentInitialSpecialties: SpecialtiesSelection | null = isCurrentSpecialtiesSaved && savedSpecialties
    ? {
        facultyCode: savedSpecialties.facultyCode,
        facultyName: savedSpecialties.facultyName,
        firstSpecialtyCode: savedSpecialties.firstSpecialtyCode,
        firstSpecialtyName: savedSpecialties.firstSpecialtyName,
        secondSpecialtyCode: savedSpecialties.secondSpecialtyCode,
        secondSpecialtyName: savedSpecialties.secondSpecialtyName,
      }
    : null;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-10">
      {savedSelection && (
        <div className="mb-3 rounded-md border border-[#711610]/30 bg-[#E6D9AA]/30 px-4 py-3 text-sm text-[#711610]">
          Modalidad guardada en sesion: <strong>{savedSelection.modalityTitle}</strong>
        </div>
      )}

      {savedSpecialties && (
        <div className="mb-4 rounded-md border border-[#711610]/30 bg-[#E6D9AA]/20 px-4 py-3 text-sm text-[#711610]">
          Especialidades guardadas: <strong>{savedSpecialties.firstSpecialtyName}</strong>
          {savedSpecialties.secondSpecialtyName ? ` y ${savedSpecialties.secondSpecialtyName}` : ""}
        </div>
      )}

      {screen === 1 && hasCompletedSetup && !showEditionFlow && (
        <>
          <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">
              Modalidad ya configurada
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">Continuar proceso</h1>
            <p className="mt-2 text-sm text-[#711610]">
              Ya registraste modalidad y especialidades. Puedes continuar directamente o modificar la selección.
            </p>
          </header>

          <article className="mb-6 rounded-lg border border-[#9A999D]/30 bg-white p-5 text-sm text-[#711610]">
            <p>
              Modalidad: <strong>{savedSelection?.modalityTitle}</strong>
            </p>
            <p className="mt-2">
              Especialidades: <strong>{savedSpecialties?.firstSpecialtyName}</strong>
              {savedSpecialties?.secondSpecialtyName ? ` y ${savedSpecialties.secondSpecialtyName}` : ""}
            </p>
          </article>

          <footer className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/documents"
              className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
            >
              Continuar a documentos
            </Link>

            <button
              type="button"
              onClick={() => setShowEditionFlow(true)}
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Modificar modalidad
            </button>
          </footer>
        </>
      )}

      {screen === 1 && (!hasCompletedSetup || showEditionFlow) && (
        <>
          <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso interno 1 de 4</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">Modalidad - Division</h1>
            <p className="mt-2 text-sm text-[#711610]">
              Seleccione la division correcta del postulante. No seleccione una division del padre, madre o apoderado.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {divisions.map((division) => (
              <button
                key={division.id}
                type="button"
                onClick={() => openDivision(division.id)}
                className="overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white text-left transition hover:border-[#711610]/50 hover:shadow-md"
              >
                <img src={division.imageUrl} alt={division.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-[#711610]">{division.title}</h2>
                  <p className="mt-1 text-sm text-[#711610]">{division.audience}</p>
                </div>
              </button>
            ))}
          </div>

          <footer className="mt-6 flex items-center justify-between gap-3">
            <Link
              href="/personal-data"
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Regresar
            </Link>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-[#9A999D] px-5 py-2 text-sm font-medium text-white"
            >
              Seleccione una division
            </button>
          </footer>
        </>
      )}

      {screen === 2 && selectedDivision && (
        <>
          <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso interno 2 de 4</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">{selectedDivision.title}</h1>
            <p className="mt-2 text-sm text-[#711610]">Seleccione la modalidad final.</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedDivision.modalities.map((modality) => (
              <button
                key={modality.id}
                type="button"
                onClick={() => openModality(modality.id)}
                className="overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white text-left transition hover:border-[#711610]/50 hover:shadow-md"
              >
                <img src={modality.imageUrl} alt={modality.title} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h2 className="text-base font-semibold text-[#711610]">{modality.title}</h2>
                </div>
              </button>
            ))}
          </div>

          <footer className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setScreen(1)}
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Regresar
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-[#9A999D] px-5 py-2 text-sm font-medium text-white"
            >
              Seleccione modalidad final
            </button>
          </footer>
        </>
      )}

      {screen === 3 && selectedDivision && selectedModality && (
        <>
          <header className="mb-6 rounded-lg border border-[#711610]/20 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#711610]">Paso interno 3 de 4</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#711610] md:text-3xl">{selectedModality.title}</h1>
            <p className="mt-2 text-sm text-[#711610]">
              Revise esta descripcion y confirme que corresponde al postulante.
            </p>
          </header>

          <article className="overflow-hidden rounded-lg border border-[#9A999D]/30 bg-white">
            <img src={selectedModality.imageUrl} alt={selectedModality.title} className="h-64 w-full object-cover" />
            <div className="space-y-3 p-5">
              <p className="text-sm text-[#711610]">Division: {selectedDivision.title}</p>
              <p className="text-sm text-[#711610]">{selectedModality.description}</p>
              <p className="rounded-md border border-[#711610]/20 bg-[#E6D9AA]/25 p-3 text-sm text-[#711610]">
                Importante: esta modalidad debe corresponder al postulante. No registrar modalidad del padre, madre o
                apoderado.
              </p>
            </div>
          </article>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setScreen(2)}
              className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
            >
              Regresar
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveSelection}
                className="rounded-md bg-[#711610] px-5 py-2 text-sm font-medium text-white hover:bg-[#5e120d]"
              >
                Elegir esta
              </button>

              {isCurrentSelectionSaved ? (
                specialtiesFlow === "default" ? (
                  <button
                    type="button"
                    onClick={() => setScreen(4)}
                    className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
                  >
                    Siguiente
                  </button>
                ) : (
                  <Link
                    href="/documents"
                    className="rounded-md border border-[#711610] px-5 py-2 text-sm font-medium text-[#711610] hover:bg-[#711610]/10"
                  >
                    Siguiente
                  </Link>
                )
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
      )}

      {screen === 4 && selectedDivision && selectedModality && specialtiesFlow === "default" && (
        <FacultySpecialtiesForm
          faculties={FACULTIES}
          initialSelection={currentInitialSpecialties}
          isSaved={isCurrentSpecialtiesSaved}
          onBack={() => setScreen(3)}
          onSave={saveSpecialtiesSelection}
          continueHref="/documents"
        />
      )}
    </section>
  );
}
