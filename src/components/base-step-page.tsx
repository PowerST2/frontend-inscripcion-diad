import Link from "next/link";

type BaseStepPageProps = {
  title: string;
  nextHref?: string;
  prevHref?: string;
};

export default function BaseStepPage({ title, nextHref, prevHref }: BaseStepPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="mb-10 text-3xl font-semibold text-[#711610] md:text-5xl">{title}</h1>
      <div className="flex w-full max-w-sm items-center justify-center gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded-md border border-[#711610] px-6 py-3 text-base font-medium text-[#711610] hover:bg-[#711610]/10"
          >
            Regresar
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-[#9A999D] px-6 py-3 text-base font-medium text-[#9A999D]"
          >
            Regresar
          </button>
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-md bg-[#711610] px-6 py-3 text-base font-medium text-white hover:bg-[#5e120d]"
          >
            Siguiente
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md bg-[#9A999D] px-6 py-3 text-base font-medium text-white"
          >
            Siguiente
          </button>
        )}
      </div>
    </section>
  );
}
